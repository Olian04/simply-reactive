import type { Atom } from "./Atom";
import type { Resource } from "./Resource";
import type { Selector } from "./Selector";

export type Gettable<T> =
 | Atom<T>
 | Selector<T>
 | Resource<T>;