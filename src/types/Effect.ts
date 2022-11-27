import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsDestroy } from './traits/ImplementsDestroy';
import type { ImplementsRestore } from './traits/ImplementsRestore';

export type Effect = ImplementsKey & ImplementsDestroy & ImplementsRestore;
