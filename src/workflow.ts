import { IStore, IHelper } from './types.js'
import { Awaitable } from '@blackglory/prelude'
import { bind } from 'extra-proxy'
import { Helper } from './helper.js'

export class Workflow<DataType, Args extends unknown[], Result> {
  constructor(
    private fn: (helper: IHelper<DataType>, ...args: Args) => Awaitable<Result>
  ) {}

  async call(
    { store, signal }: {
      store: IStore<DataType>
      signal?: AbortSignal
    }
  , ...args: Args
  ): Promise<Result> {
    signal?.throwIfAborted()

    const helper = new Helper(store, signal)
    const result = await this.fn.call(this, bind(helper), ...args)
    signal?.throwIfAborted()

    return result
  }
}
