# extra-workflow
## Install
```sh
npm install --save extra-workflow
# or
yarn add extra-workflow
```

## Usage
```ts
import { Workflow, call } from 'extra-workflow'
import { MemoryStore } from '@extra-workflow/memory-store'

const fetchJSON = new Workflow(function* (url: string) {
  const json = yield* call(
    signal => fetch(url, { signal }).then(res => res.json())
  )

  return json
})

const store = new MemoryStore()

const result1 = await workflow.call({ store }, 'http://example.com')
const result2 = await workflow.call({ store }, 'http://example.com')

assert(result1 === result2)
```

## API
```ts
interface IRecord<T> {
  type: 'result' | 'error'
  value: T
}

interface IStore<T> {
  get(index: number): Awaitable<IRecord<T> | Falsy>
  set(index: number, record: IRecord<T>): Awaitable<void>
}
```

### Workflow
```ts
class Workflow<DataType, Args extends DataType[], Return> {
  constructor(
    fn: (...args: Args) =>
    | Generator<Call<DataType, DataType>, Return, DataType>
    | AsyncGenerator<Call<DataType, DataType>, Return, DataType>
  )

  call(
    context: {
      store: IStore<DataType>
      signal?: AbortSignal
    }
  , ...args: Args
  ): Promise<Return>
}
```

### call
```ts
function call<DataType, Return extends DataType = DataType>(
  fn: (signal?: AbortSignal) => Awaitable<Result>
): Call<DataType, Result>
```
