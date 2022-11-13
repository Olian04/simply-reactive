import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';

export type Selector<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe;
