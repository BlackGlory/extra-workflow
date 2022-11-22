import { call, Call } from '@src/call'

test('call', () => {
  const fn = () => 'foo'

  const result = call(fn)

  expect(result).toBeInstanceOf(Call)
  expect(result.fn).toBe(fn)
})

describe('Call', () => {
  test('fn', () => {
    const fn = () => 'foo'

    const result = new Call(fn)

    expect(result).toBeInstanceOf(Call)
    expect(result.fn).toBe(fn)
  })

  test('symbol.iterator', () => {
    const fn = () => 'foo'
    const call = new Call(fn)

    const iter = call[Symbol.iterator]()
    const result1 = iter.next()
    const result2 = iter.next('bar')

    expect(result1).toStrictEqual({
      done: false
    , value: call
    })
    expect(result2).toStrictEqual({
      done: true
    , value: 'bar'
    })
  })
})
