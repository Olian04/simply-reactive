import type { SynchronousGetter } from "./SynchronousGetter";

export type SelectorProps<T> = {
  key: string;
  get: (ctx: {
    get: SynchronousGetter;
  }) => T;
};
