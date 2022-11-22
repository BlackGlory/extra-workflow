import { MemoryStore } from '@src/memory-store'
import { IRecord } from '@src/types'

describe('MemoryStore', () => {
  describe('set', () => {
    test('record does not exist', () => {
      const store = new MemoryStore()
      const record: IRecord<string> = {
        type: 'result'
      , value: 'value'
      }

      store.set(0, record)

      expect(store.dump()).toStrictEqual([
        record
      ])
    })

    test('record exists', () => {
      const store = new MemoryStore()
      const oldRecord: IRecord<string> = {
        type: 'result'
      , value: 'old-value'
      }
      store.set(0, oldRecord)
      const newRecord: IRecord<string> = {
        type: 'result'
      , value: 'new-value'
      }

      store.set(0, newRecord)

      expect(store.dump()).toStrictEqual([
        newRecord
      ])
    })
  })

  describe('get', () => {
    test('record exists', () => {
      const store = new MemoryStore()
      const record: IRecord<string> = {
        type: 'result'
      , value: 'value'
      }
      store.set(0, record)

      const result = store.get(0)

      expect(result).toStrictEqual(record)
    })

    test('event does not exist', () => {
      const store = new MemoryStore()

      const result = store.get(0)

      expect(result).toBeUndefined()
    })
  })

  test('clear', () => {
    const store = new MemoryStore()
    const record: IRecord<string> = {
      type: 'result'
    , value: 'value'
    }
    store.set(0, record)

    store.clear()

    expect(store.dump()).toStrictEqual([])
  })

  test('dump', () => {
    const store = new MemoryStore()
    const record1: IRecord<string> = {
      type: 'result'
    , value: 'value-1'
    }
    const record2: IRecord<string> = {
      type: 'result'
    , value: 'value-2'
    }
    store.set(1, record2)
    store.set(0, record1)

    const result = store.dump()

    expect(result).toStrictEqual([
      record1
    , record2
    ])
  })
})
