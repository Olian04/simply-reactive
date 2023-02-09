import type { MemoryBase } from './MemoryBase';

export type EffectMemory = MemoryBase & {
  notifyTimeoutId: NodeJS.Timeout | number | undefined;
  debounceDuration: number;
  dependencies: Set<string>;
  onDependencyChange: (() => void) | null;
  onDestroy: (() => void) | null;
};
