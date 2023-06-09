import type { ImplementsGet } from './traits/ImplementsGet.js';
import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe.js';

export type Selector<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe;
