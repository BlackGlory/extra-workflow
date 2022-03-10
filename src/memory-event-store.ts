import { IEventStore } from './types'
import { assert } from '@blackglory/errors'

export class MemoryEventStore<T> implements IEventStore<T> {
  private map = new Map<string, T[]>()

  append(id: string, index: number, event: T): void {
    assert(index >= 0, 'index must be greater than or equal to 0')

    if (!this.map.has(id)) this.map.set(id, [])
    const events = this.map.get(id)!
    if (index === events.length) {
      events[index] = event
    } else {
      throw new Error(`Index ${index} is not the next index`)
    }
  }

  get(id: string, index: number): T {
    assert(index >= 0, 'index must be greater than or equal to 0')

    const events = this.map.get(id)
    if (events) {
      if (index < events.length) {
        return events[index]
      }
    }
    throw new Error(`Event #${index} is not found`)
  }

  size(id: string): number {
    const events = this.map.get(id)
    if (events) {
      return events.length
    } else {
      return 0
    }
  }

  clear(id: string): void {
    this.map.delete(id)
  }
}
