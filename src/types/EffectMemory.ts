export type EffectMemory = {
  notifyTimeoutId: NodeJS.Timeout | number | undefined;
  debounceDuration: number;
  unsubscribeFunctions: (() => void)[];
};
