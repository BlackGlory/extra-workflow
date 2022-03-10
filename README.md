# greatsword
The orchestrator library based on generators and event sourcing.

## Install
```sh
npm install --save greatsword
# or
yarn add greatsword
```

## Usage
```ts
import { Greatsword } from 'greatsword'

const greatsword = new Greatsword(eventStore)

const result = await greatsword.execute('fetch', function* () {
  return yield call(() => fetch('http://example.com').then(res => res.text()))
})
```

## API
```ts
interface IEventStore<T> {
  /**
   * The index of the appended event needs to be explicitly specified.
   * The method should throw an error when the index is not the index of the next event.
   */
  append(id: string, index: number, event: T): Awaitable<void>

  /**
   * This method should throw an error when the event at the index does not exist.
   */
  get(id: string, index: number): Awaitable<T>

  size(id: string): Awaitable<number>
}

type Procedure = Call<unknown>
```

### Greatsword
```ts
class Greatsword<T> {
  constructor(store: IEventStore<T>)

  execute<Result extends T>(
    id: string
  , workflow: () => Generator<Procedure, Result, T>
  ): Promise<Result>
}
```

### Helpers
#### call
```
function call<T>(fn: () => Awaitable<T>): Call<T>
```
