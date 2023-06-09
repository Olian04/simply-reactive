import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsDestroy } from './traits/ImplementsDestroy.js';
import type { ImplementsRestore } from './traits/ImplementsRestore.js';

export type EffectGroup = ImplementsKey & ImplementsDestroy & ImplementsRestore;
