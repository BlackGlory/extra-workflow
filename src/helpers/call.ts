import { Awaitable } from 'justypes'
import { Call } from '@src/procedures'

export function call<T>(fn: () => Awaitable<T>): Call<T> {
  return new Call(fn)
}
