import type { ImplementsGet } from './traits/ImplementsGet.js';
import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsSet } from './traits/ImplementsSet.js';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe.js';

export type Atom<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSet<T> &
  ImplementsSubscribe;
