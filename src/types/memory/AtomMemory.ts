import type { Serializeable } from '../util/Serializeable.js';
import type { MemoryBase } from './MemoryBase.js';

export type AtomMemory = MemoryBase & {
  value: Serializeable;
  valueHash: string;
  subscribers: Set<string>;
};
