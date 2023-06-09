import type { MemoryBase } from './MemoryBase.js';

export type AtomMemory = MemoryBase & {
  value: unknown;
  subscribers: Set<string>;
};
