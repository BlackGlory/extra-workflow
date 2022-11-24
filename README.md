# extra-workflow
## Install
```sh
npm install --save extra-workflow
# or
yarn add extra-workflow
```

## When would you need it?
- You're dealing with massive datasets,
  you don't want intermediate data to be lost when the program crashes.
- You want the program to be interrupted and resumed later.

## Usage
```ts
import { Workflow } from 'extra-workflow'
import { MemoryStore } from '@extra-workflow/memory-store'

const fetchJSON = new Workflow(async ({ call }, url: string) => {
  const json = await call(signal => fetch(url, { signal }).then(res => res.json()))

  return json
})

const store = new MemoryStore()

const result1 = await workflow.call({ store }, 'http://example.com')
const result2 = await workflow.call({ store }, 'http://example.com')

assert(result1 === result2)
```

## API
```ts
interface IHelper<DataType> {
  call<Result extends DataType>(
    fn: (signal?: AbortSignal) => Awaitable<Result>
  ): Promise<Result>
}

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
class Workflow<DataType, Args extends unknown[], Result> {
  constructor(fn: (helper: IHelper<DataType>, ...args: Args) => Awaitable<Result>)

  async call(
    options: {
      store: IStore<DataType>
      signal?: AbortSignal
    }
  , ...args: Args
  ): Promise<Result>
}
```
