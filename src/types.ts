import { Awaitable, Falsy } from '@blackglory/prelude'

export interface IRecord<T> {
  type: 'result' | 'error'
  value: T
}

export interface IStore<T> {
  get(index: number): Awaitable<IRecord<T> | Falsy>
  set(index: number, record: IRecord<T>): Awaitable<void>
}
