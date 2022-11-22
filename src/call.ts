import { Awaitable } from '@blackglory/prelude'

export function call<DataType, Return extends DataType = DataType>(
  fn: (signal?: AbortSignal) => Awaitable<Return>
): Call<DataType, Return> {
  return new Call(fn)
}

export class Call<DataType, Result extends DataType = DataType> {
  * [Symbol.iterator](): Iterator<
    Call<DataType, Result>
  , Result
  , DataType
  > {
    const value = yield this
    return value as Result
  }

  constructor(
    public fn: (signal?: AbortSignal) => Awaitable<Result>
  ) {}
}
