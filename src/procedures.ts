import { Awaitable } from 'justypes'

export type Procedure = Call<unknown>

export class Call<T> {
  constructor(public fn: () => Awaitable<T>) {}
}
