import { CustomError } from '@blackglory/errors'
import { Procedure, Call } from './procedures'
import { IEventStore } from './types'

export class Greatsword<T> {
  constructor(private store: IEventStore<T>) {}

  /**
   * @throws {AppendFailed}
   */
  async execute<Result extends T>(
    id: string
  , workflow: () => Generator<Procedure, Result, T>
  ): Promise<Result> {
    const gen = workflow()
    let currentIndex = 0
    let { value, done } = gen.next()
    if (done) return value as Result

    // 恢复工作流的状态
    const size = await this.store.size(id)
    while (currentIndex < size) {
      const result = await this.store.get(id, currentIndex)
      ;({ value, done } = gen.next(result))
      if (done) return value as Result
      currentIndex++
    }

    // 继续执行工作流
    while (true) {
      if (value instanceof Call) {
        const result = await value.fn() as T
        await this.store.append(id, currentIndex, result)
        ;({ value, done } = gen.next(result))
        if (done) return value as Result
      } else {
        throw new UnknownProcedure(value)
      }
      currentIndex++
    }
  }
}

export class UnknownProcedure extends CustomError {
  constructor(value: unknown) {
    super(`${value}`)
  }
}
