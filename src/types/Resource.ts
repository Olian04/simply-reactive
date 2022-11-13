import type { Gettable } from './traits/Gettable';
import type { Keyed } from './traits/Keyed';
import type { Subscribable } from './traits/Subscribable';
import type { Invalidatable } from './traits/Invalidatable';

export type Resource<T> = Keyed & Gettable<T> & Subscribable & Invalidatable;
