import { MemoryEventStore } from '@src/memory-event-store'
import { getError } from 'return-style'

describe('MemoryEventStore', () => {
  describe('append', () => {
    test('correct index', () => {
      const store = new MemoryEventStore()

      const result = store.append('id', 0, 'event')

      expect(result).toBe(result)
    })

    test('incorrect index', () => {
      const store = new MemoryEventStore()

      const err = getError(() => store.append('id', 1, 'event'))

      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('get', () => {
    test('event exists', () => {
      const store = new MemoryEventStore()
      store.append('id', 0, 'event')

      const result = store.get('id', 0)

      expect(result).toBe('event')
    })

    test('event does not exist', () => {
      const store = new MemoryEventStore()

      const err = getError(() => store.get('id', 0))

      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('size', () => {
    test('empty', () => {
      const store = new MemoryEventStore()

      const result = store.size('id')

      expect(result).toBe(0)
    })

    test('non-empty', () => {
      const store = new MemoryEventStore()
      store.append('id', 0, 'event')

      const result = store.size('id')

      expect(result).toBe(1)
    })
  })
})
