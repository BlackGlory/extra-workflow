import { Workflow } from '@src/workflow'
import { getErrorPromise } from 'return-style'
import { AbortController } from 'extra-abort'
import { delay } from 'extra-promise'
import { IRecord, IStore, IHelper } from '@src/types'

describe('Workflow', () => {
  describe('call', () => {
    test('returns a value', async () => {
      const store = new MemoryStore()
      const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
        return await call(() => text)
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
      const store = new MemoryStore()
      const mockedWorkflow = jest.fn(async (_: IHelper<any>, text: string) => {
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
        const store = new MemoryStore()
        const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
          return await call(() => {
            throw customError
          })
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
        const store = new MemoryStore()
        const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
          try {
            const result = await call(() => {
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
      const store = new MemoryStore()
      const passThrough = jest.fn((text: string) => text)
      const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
        return await call(() => passThrough(text))
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
        const store = new MemoryStore()
        const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
          return await call(() => text)
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
          const store = new MemoryStore()
          const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
            return await call(() => text)
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
          const store = new MemoryStore()
          const mockedWorkflow = jest.fn(async ({ call }: IHelper<any>, text: string) => {
            return await call(() => delay(1000))
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

class MemoryStore<T> implements IStore<T> {
  private store: Array<IRecord<T>> = []

  set(index: number, record: IRecord<T>): void {
    this.store[index] = record
  }

  get(index: number): IRecord<T> | undefined {
    return this.store[index]
  }

  dump(): Array<IRecord<T>> {
    return [...this.store]
  }
}
