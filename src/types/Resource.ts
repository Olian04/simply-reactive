import type { ImplementsGet } from './traits/ImplementsGet.js';
import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe.js';
import type { ImplementsInvalidate } from './traits/ImplementsInvalidate.js';

export type Resource<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe &
  ImplementsInvalidate;
