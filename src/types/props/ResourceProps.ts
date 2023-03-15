export type ResourceProps<T> = {
  key?: string;
  get: () => T;
};
