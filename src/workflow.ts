import { IStore, IHelper } from './types'
import { Awaitable } from '@blackglory/prelude'
import { bind } from 'extra-proxy'
import { Helper } from './helper'

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

    const context = new Helper(store, signal)
    const result = await this.fn.call(this, bind(context), ...args)
    signal?.throwIfAborted()

    return result
  }
}
