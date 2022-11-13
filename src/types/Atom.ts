import type { Gettable } from './traits/Gettable';
import type { Keyed } from './traits/Keyed';
import type { Settable } from './traits/Settable';
import type { Subscribable } from './traits/Subscribable';

export type Atom<T> = Keyed & Gettable<T> & Settable<T> & Subscribable;
