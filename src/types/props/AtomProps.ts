import type { Serializeable } from '../util/Serializeable.js';

export type AtomProps<T extends Serializeable> = {
  key?: string;
  default: T;
};
