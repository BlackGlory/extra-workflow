import { Awaitable } from '@blackglory/prelude'

export interface IEventStore<T> {
  /**
   * The index of the appended event needs to be explicitly specified.
   * The method should throw an error when the index is not the index of the next event.
   */
  append(id: string, index: number, event: T): Awaitable<void>

  /**
   * This method should throw an error when the event at the index does not exist.
   */
  get(id: string, index: number): Awaitable<T>

  size(id: string): Awaitable<number>
}
