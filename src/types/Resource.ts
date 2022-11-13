import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';
import type { ImplementsInvalidate } from './traits/ImplementsInvalidate';

export type Resource<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe &
  ImplementsInvalidate;
