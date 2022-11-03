import type { Atom } from "./Atom";
import type { Resource } from "./Resource";
import type { Selector } from "./Selector";

export type Getter = {
  <T,>(gettable: Resource<T>): Promise<T>;
  <T,>(gettable: Atom<T>): T;
  <T,>(gettable: Selector<T>): T;
}