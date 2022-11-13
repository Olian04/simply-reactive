export type Settable<T> = {
  set: (valueOrFunction: T | ((old: T) => T)) => void;
};
