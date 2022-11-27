import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsSet } from './traits/ImplementsSet';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';

export type QueryAtom<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSet<T> &
  ImplementsSubscribe & {
    urlWhenSet: (valueOrFunction: T | ((old: T) => T)) => string;
  };
