export type Atom<T> = {
  key: string;
  get: () => T;
  set: (valueOrFunction: T | ((old: T) => T)) => void;
  subscribe: (id: string, notifyCallback: () => void) => () => void;
}