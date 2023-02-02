import type { MemoryBase } from './MemoryBase';

export type AtomMemory = MemoryBase & {
  value: unknown;
  subscribers: Set<string>;
};
