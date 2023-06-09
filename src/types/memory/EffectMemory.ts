import type { MemoryBase } from './MemoryBase.js';

export type EffectMemory = MemoryBase & {
  notifyTimeoutId: NodeJS.Timeout | number | undefined;
  debounceDuration: number;
  dependencies: Set<string>;
  onDependencyChange: (() => void) | null;
  onDestroy: (() => void) | null;
};
