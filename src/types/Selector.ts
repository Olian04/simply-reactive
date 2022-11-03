export type Selector<T> = {
  key: string;
  get: () => T;
  subscribe: (id: string, notifyCallback: () => void) => () => void;
}