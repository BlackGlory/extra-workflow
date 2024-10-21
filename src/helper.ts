import { IHelper, IRecord, IStore } from './types.js'
import { Result as ReturnResult, toResultAsync } from 'return-style'
import { Awaitable, isntFalsy } from '@blackglory/prelude'

export class Helper<DataType> implements IHelper<DataType> {
  private index: number = 0

  constructor(private store: IStore<DataType>, private signal?: AbortSignal) {}

  async call<Result extends DataType>(
    fn: (signal?: AbortSignal) => Awaitable<Result>
  ): Promise<Result> {
    this.signal?.throwIfAborted()

    const record = await this.getRecord(this.index++, fn)
    this.signal?.throwIfAborted()

    switch (record.type) {
      case 'result': return record.value as Result
      case 'error': throw record.value
    }
  }

  private async getRecord<Result extends DataType>(
    index: number
  , fn: (signal?: AbortSignal) => Awaitable<Result>
  ): Promise<IRecord<DataType>> {
    const record = await this.store.get(index)
    this.signal?.throwIfAborted()

    if (isntFalsy(record)) {
      return record
    } else {
      const result = await toResultAsync<DataType, DataType>(() => fn(this.signal))
      this.signal?.throwIfAborted()

      const record = convertResultToRecord(result)

      await this.store.set(index, record)
      this.signal?.throwIfAborted()

      return record
    }
  }
}

function convertResultToRecord<DataType>(
  result: ReturnResult<DataType, DataType>
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
