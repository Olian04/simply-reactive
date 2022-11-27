import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsDestroy } from './traits/ImplementsDestroy';
import type { ImplementsRestore } from './traits/ImplementsRestore';

export type EffectGroup = ImplementsKey & ImplementsDestroy & ImplementsRestore;
