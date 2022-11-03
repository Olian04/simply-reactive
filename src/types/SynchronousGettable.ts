import type { Atom } from "./Atom";
import type { Selector } from "./Selector";

export type SynchronousGettable<T> =
 | Atom<T>
 | Selector<T>;
 