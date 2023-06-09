import type { ImplementsGet } from './traits/ImplementsGet.js';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe.js';
import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsDestroy } from './traits/ImplementsDestroy.js';
import type { ImplementsRestore } from './traits/ImplementsRestore.js';

export type ExternalSelector<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe &
  ImplementsDestroy &
  ImplementsRestore;
