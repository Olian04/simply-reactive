import type { Gettable } from './traits/Gettable';
import type { Keyed } from './traits/Keyed';
import type { Subscribable } from './traits/Subscribable';

export type Selector<T> = Keyed & Gettable<T> & Subscribable;
