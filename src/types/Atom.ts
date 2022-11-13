import { SubscribeFunction } from './SubscribeFunction';

export type Atom<T> = {
  key: string;
  get: () => T;
  set: (valueOrFunction: T | ((old: T) => T)) => void;
  subscribe: SubscribeFunction;
};
