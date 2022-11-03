export type Resource<T> = {
  key: string;
  get: () => Promise<T>;
  subscribe: (id: string, notifyCallback: () => void) => () => void;
}