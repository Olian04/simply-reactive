import type { Atom } from "./Atom";
import type { Selector } from "./Selector";

export type SynchronousGetter = {
  <T,>(gettable: Atom<T>): T;
  <T,>(gettable: Selector<T>): T;
}