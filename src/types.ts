import { Awaitable, Falsy } from '@blackglory/prelude'

export interface IRecord<DataType> {
  type: 'result' | 'error'
  value: DataType
}

export interface IStore<DataType> {
  get(index: number): Awaitable<IRecord<DataType> | Falsy>
  set(index: number, record: IRecord<DataType>): Awaitable<void>
}
