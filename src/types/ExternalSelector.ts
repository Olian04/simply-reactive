import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsDestroy } from './traits/ImplementsDestroy';
import type { ImplementsRestore } from './traits/ImplementsRestore';

export type ExternalSelector<T> = ImplementsKey &
  ImplementsGet<T> &
  ImplementsSubscribe &
  ImplementsDestroy &
  ImplementsRestore;
