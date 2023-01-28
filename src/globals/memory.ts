import type { MemoryBase } from '../types/MemoryBase';

const globalStrongMemory = new Map<string, MemoryBase>();

const globalWeakMemory = new Map<string, WeakRef<MemoryBase>>();

const globalWeakMemoryCleanupRegistry = new FinalizationRegistry<string>(
  (key) => {
    globalWeakMemory.delete(key);
  }
);

export const getMemoryOrDefault = <V extends MemoryBase>(
  key: string,
  getDefaultMemory: () => V,
  forceStrongMemory: boolean = false
): V => {
  const maybeMemory = getMemory(key);

  if (maybeMemory) {
    return maybeMemory as V;
  }

  const memory = getDefaultMemory();
  if (forceStrongMemory) {
    setStrongMemory(key, memory);
  } else {
    setWeakMemory(key, memory);
  }
  return memory;
};

export const setWeakMemory = <V extends MemoryBase>(key: string, value: V) => {
  globalWeakMemoryCleanupRegistry.register(value, key);
  globalWeakMemory.set(key, new WeakRef(value));
};

export const setStrongMemory = <V extends MemoryBase>(
  key: string,
  value: V
) => {
  globalStrongMemory.set(key, value);
};

export const deleteMemory = (key: string) => {
  if (globalWeakMemory.has(key)) {
    globalWeakMemory.delete(key);
  }
  if (globalStrongMemory.has(key)) {
    globalStrongMemory.delete(key);
  }
};

export const getMemory = <T extends MemoryBase>(key: string) => {
  if (globalWeakMemory.has(key)) {
    return globalWeakMemory.get(key)?.deref() as T | undefined;
  }
  if (globalStrongMemory.has(key)) {
    return globalStrongMemory.get(key) as T;
  }
  return undefined;
};

export const getAllLivingMemory = <T extends MemoryBase>(): T[] => {
  return [...globalWeakMemory.values()]
    .map((ref) => ref.deref())
    .filter((maybeVal) => maybeVal !== undefined) as T[];
};
