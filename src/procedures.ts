import { Awaitable } from '@blackglory/prelude'

export type Procedure = Call<unknown>

export class Call<T> {
  constructor(public fn: () => Awaitable<T>) {}
}
