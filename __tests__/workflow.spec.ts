import { Workflow } from '@src/workflow'
import { call } from '@src/call'
import { MemoryDataStore } from '@src/memory-data-store'
import { getErrorPromise } from 'return-style'
import { AbortController } from 'extra-abort'
import { delay } from 'extra-promise'

describe('Workflow', () => {
  describe('call', () => {
    test('returns a value', async () => {
      const store = new MemoryDataStore()
      const mockedWorkflow = jest.fn(function* (text: string) {
        const result = yield* call(() => text)
        return result
      })
      const workflow = new Workflow(mockedWorkflow)

      const result = await workflow.call({ store }, 'foo')

      expect(result).toBe('foo')
      expect(mockedWorkflow).toBeCalledTimes(1)
      expect(store.dump()).toStrictEqual([
        {
          type: 'result'
        , value: 'foo'
        }
      ])
    })

    test('throws a error', async () => {
      const customError = new Error('custom error')
      const store = new MemoryDataStore()
      const mockedWorkflow = jest.fn(function* (text: string) {
        throw customError
      })
      const workflow = new Workflow(mockedWorkflow)

      const err = await getErrorPromise(workflow.call({ store }, 'foo'))

      expect(err).toBe(customError)
      expect(mockedWorkflow).toBeCalledTimes(1)
      expect(store.dump()).toStrictEqual([])
    })

    describe('Call throws a error', () => {
      test('not caught', async () => {
        const customError = new Error('custom error')
        const store = new MemoryDataStore()
        const mockedWorkflow = jest.fn(function* (text: string) {
          const result = yield* call(() => {
            throw customError
          })
          return result
        })
        const workflow = new Workflow(mockedWorkflow)

        const err = await getErrorPromise(workflow.call({ store }, 'foo'))

        expect(err).toBe(customError)
        expect(mockedWorkflow).toBeCalledTimes(1)
        expect(store.dump()).toStrictEqual([
          {
            type: 'error'
          , value: customError
          }
        ])
      })

      test('caught', async () => {
        const customError = new Error('custom error')
        const store = new MemoryDataStore()
        const mockedWorkflow = jest.fn(function* (text: string) {
          try {
            const result = yield* call(() => {
              throw customError
            })
            return result
          } catch {
            return 'bar'
          }
        })
        const workflow = new Workflow(mockedWorkflow)

        const result = await workflow.call({ store }, 'foo')

        expect(result).toBe('bar')
        expect(mockedWorkflow).toBeCalledTimes(1)
        expect(store.dump()).toStrictEqual([
          {
            type: 'error'
          , value: customError
          }
        ])
      })
    })

    test('memorize intermediate values', async () => {
      const store = new MemoryDataStore()
      const passThrough = jest.fn((text: string) => text)
      const mockedWorkflow = jest.fn(function* (text: string) {
        const result = yield* call(() => passThrough(text))
        return result
      })
      const workflow = new Workflow(mockedWorkflow)

      const result1 = await workflow.call({ store }, 'foo')
      const result2 = await workflow.call({ store }, 'bar')

      expect(result1).toBe('foo')
      expect(result2).toBe('foo')
      expect(mockedWorkflow).toBeCalledTimes(2)
      expect(passThrough).toBeCalledTimes(1)
      expect(store.dump()).toStrictEqual([
        {
          type: 'result'
        , value: 'foo'
        }
      ])
    })

    describe('signal', () => {
      test('not aborted', async () => {
        const store = new MemoryDataStore()
        const mockedWorkflow = jest.fn(function* (text: string) {
          const result = yield* call(() => text)
          return result
        })
        const workflow = new Workflow(mockedWorkflow)
        const controller = new AbortController()

        const result = await workflow.call(
          {
            store
          , signal: controller.signal
          }
        , 'foo'
        )

        expect(result).toBe('foo')
        expect(mockedWorkflow).toBeCalledTimes(1)
        expect(store.dump()).toStrictEqual([
          {
            type: 'result'
          , value: 'foo'
          }
        ])
      })

      describe('aborted', () => {
        test('earlier than calling', async () => {
          const customError = new Error('custom error')
          const store = new MemoryDataStore()
          const mockedWorkflow = jest.fn(function* (text: string) {
            const result = yield* call(() => text)
            return result
          })
          const workflow = new Workflow(mockedWorkflow)
          const controller = new AbortController()
          controller.abort(customError)

          const err = await getErrorPromise(workflow.call(
            {
              store
            , signal: controller.signal
            }
          , 'foo'
          ))

          expect(err).toBe(customError)
          expect(mockedWorkflow).toBeCalledTimes(0)
          expect(store.dump()).toStrictEqual([])
        })

        test('later than calling', async () => {
          const customError = new Error('custom error')
          const store = new MemoryDataStore()
          const mockedWorkflow = jest.fn(function* (text: string) {
            const result = yield* call(() => delay(1000))
            return result
          })
          const workflow = new Workflow(mockedWorkflow)
          const controller = new AbortController()

          queueMicrotask(() => controller.abort(customError))
          const err = await getErrorPromise(workflow.call(
            {
              store
            , signal: controller.signal
            }
          , 'foo'
          ))

          expect(err).toBe(customError)
          expect(mockedWorkflow).toBeCalledTimes(1)
          expect(store.dump()).toStrictEqual([])
        })
      })
    })
  })
})
