import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsSet } from './traits/ImplementsSet';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';

export type Atom<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSet<T> &
  ImplementsSubscribe;
