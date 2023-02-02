import type { MemoryBase } from './MemoryBase';

export type SelectorMemory = MemoryBase & {
  value: unknown;
  isDirty: boolean;
  subscribers: Set<string>;
  dependencies: Set<string>;
};
