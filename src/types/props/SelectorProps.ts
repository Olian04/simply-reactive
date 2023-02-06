export type SelectorProps<T> = {
  key?: string;
  get: () => T;
};
