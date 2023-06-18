import type { Serializeable } from '../util/Serializeable.js';
import type { MemoryBase } from './MemoryBase.js';

export type SelectorMemory = MemoryBase & {
  value: Serializeable;
  valueHash: string;
  valueHashMap: Record<string, unknown>;
  isDirty: boolean;
  subscribers: Set<string>;
  dependencies: Set<string>;
};
