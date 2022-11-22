import { IRecord, IDataStore } from './types'

export class MemoryDataStore<DataType> implements IDataStore<DataType> {
  private store: Array<IRecord<DataType>> = []

  set(index: number, record: IRecord<DataType>): void {
    this.store[index] = record
  }

  get(index: number): IRecord<DataType> | undefined {
    return this.store[index]
  }

  clear(): void {
    this.store = []
  }

  dump(): Array<IRecord<DataType>> {
    return [...this.store]
  }
}
