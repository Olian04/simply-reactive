import { MemoryBase } from './MemoryBase';

export type EffectMemory = MemoryBase & {
  notifyTimeoutId: NodeJS.Timeout | number | undefined;
  debounceDuration: number;
  onDependencyChange: (() => void) | null;
};
