export type GroupProps<T> = {
  key?: string;
  getDefault: (id: string) => T;
};
