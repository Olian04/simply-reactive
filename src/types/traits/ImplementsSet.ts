export type ImplementsSet<T> = {
  set: (valueOrFunction: T | ((old: T) => T)) => void;
};
