import { Call } from './call'
import { IRecord, IStore } from './types'
import { Result, toResultAsync } from 'return-style'
import { isntFalsy } from '@blackglory/prelude'

export class Workflow<DataType, Args extends DataType[], Return> {
  constructor(
    private fn: (...args: Args) => 
    | Generator<Call<DataType, DataType>, Return, DataType>
    | AsyncGenerator<Call<DataType, DataType>, Return, DataType>
  ) {}

  async call(
    { store, signal }: {
      store: IStore<DataType>
      signal?: AbortSignal
    }
  , ...args: Args
  ): Promise<Return> {
    signal?.throwIfAborted()

    const generator = this.fn(...args)
    signal?.throwIfAborted()

    let { value, done } = await generator.next()
    signal?.throwIfAborted()

    let index = 0

    while (!done) {
      const record: IRecord<DataType> = await this.getRecord(
        store
      , index
      , value as Call<DataType, DataType>
      , signal
      )
      signal?.throwIfAborted()

      switch (record.type) {
        case 'result': {
          ;({ value, done } = await generator.next(record.value))
          signal?.throwIfAborted()
          break
        }
        case 'error': {
          ;({ value, done } = await generator.throw(record.value))
          signal?.throwIfAborted()
          break
        }
        default: throw new Error('Unknown record type')
      }

      index++
    }

    return value as Return
  }

  private async getRecord(
    store: IStore<DataType>
  , index: number
  , call: Call<DataType, DataType>
  , signal?: AbortSignal
  ): Promise<IRecord<DataType>> {
    const record = await store.get(index)
    signal?.throwIfAborted()

    if (isntFalsy(record)) {
      return record
    } else {
      const result = await toResultAsync<DataType, DataType>(() => {
        return (call as Call<DataType, DataType>).fn(signal)
      })
      // 如果中断是在求值时发生的, 则跳过存储部分
      signal?.throwIfAborted()

      const record = convertResultToRecord(result)

      await store.set(index, record)
      signal?.throwIfAborted()

      return record
    }
  }
}

function convertResultToRecord<DataType>(
  result: Result<DataType, DataType>
): IRecord<DataType> {
  if (result.isOk()) {
    return {
      type: 'result'
    , value: result.unwrap()
    }
  } else {
    return {
      type: 'error'
    , value: result.unwrapErr()
    }
  }
}
