import { Greatsword } from '@src/greatsword'
import { Call } from '@src/procedures'
import { MemoryEventStore } from '@src/memory-event-store'

describe('Greatsword', () => {
  describe('execute', () => {
    test('do not repeat itself', async () => {
      const store = new MemoryEventStore()
      const greatsword = new Greatsword(store)
      const fn = jest.fn(() => 'result')

      const result1 = await greatsword.execute('id', function* () {
        return yield new Call(fn)
      })
      const result2 = await greatsword.execute('id', function* () {
        return yield new Call(fn)
      })

      expect(result1).toBe('result')
      expect(result2).toBe('result')
      expect(fn).toBeCalledTimes(1)
    })
  })
})
