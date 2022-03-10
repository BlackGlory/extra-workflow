import { Awaitable } from 'justypes'

export interface IEventStore<T> {
  /**
   * 需要显式指定追加事件的索引, 当索引值不是下一个事件所应具有的索引值时, 该方法应该抛出错误.
   */
  append(id: string, index: number, event: T): Awaitable<void>

  /**
   * 当索引位置的事件不存在时, 该方法应该抛出错误.
   */
  get(id: string, index: number): Awaitable<T>

  size(id: string): Awaitable<number>
}
