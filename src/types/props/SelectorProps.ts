import type { Serializeable } from '../util/Serializeable.js';

export type SelectorProps<T extends Serializeable> = {
  key?: string;
  get: () => T;
};
