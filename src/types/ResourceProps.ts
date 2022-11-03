import type { Getter } from "./Getter";

export type ResourceProps<T> = {
  key: string;
  get: (ctx: {
    get: Getter;
  }) => Promise<T>;
};
