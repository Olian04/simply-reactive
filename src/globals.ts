import type { MemoryBase } from './types/MemoryBase';
import type { SelectorMemory } from './types/SelectorMemory';
import type { AtomMemory } from './types/AtomMemory';
import type { EffectMemory } from './types/EffectMemory';

export const AUTO_KEY_PREFIX = '[auto]';
export const INTERNAL_KEY_PREFIX = '[internal]';

const globalMemory = new Map<string, WeakRef<MemoryBase>>();

const globalMemoryCleanupRegistry = new FinalizationRegistry<string>((key) => {
  globalMemory.delete(key);
});

export const getMemoryOrDefault = <V extends MemoryBase>(
  key: string,
  getDefaultMemory: () => V
): V => {
  const maybeMemory = globalMemory.get(key)?.deref();

  if (maybeMemory) {
    return maybeMemory as V;
  }

  const memory = getDefaultMemory();
  setMemory(key, memory);
  return memory;
};

export const setMemory = <V extends MemoryBase>(key: string, value: V) => {
  globalMemoryCleanupRegistry.register(value, key);
  globalMemory.set(key, new WeakRef(value));
};

export const deleteMemory = (key: string) => {
  globalMemory.delete(key);
};

const getMemory = <T extends MemoryBase>(key: string) => {
  return globalMemory.get(key)?.deref() as T | undefined;
};

export const notifyLivingSubscribers = (key: string) => {
  const mem = getMemory<AtomMemory | SelectorMemory>(key);
  if (!mem) return;
  if (!('subscribers' in mem)) return;

  for (const subKey of [...mem.subscribers.keys()]) {
    const subMem = getMemory<AtomMemory | SelectorMemory | EffectMemory>(
      subKey
    );
    if (!subMem) continue;
    if ('isDirty' in subMem) {
      subMem.isDirty = true;
    }
    if ('onDependencyChange' in subMem && subMem.onDependencyChange) {
      subMem.onDependencyChange();
    }
    if ('subscribers' in subMem) {
      notifyLivingSubscribers(subKey);
    }
  }
};

export const subscribeTo = (key: string, depKey: string) => {
  if (key === depKey) return;

  const mem = getMemory<AtomMemory | SelectorMemory>(key);
  if (!mem) return;
  if (!('subscribers' in mem)) return;

  const depMem = getMemory<EffectMemory | SelectorMemory>(depKey);
  if (!depMem) return;
  if (!('dependencies' in depMem)) return;

  mem.subscribers.add(depKey);
  depMem.dependencies.add(key);
};

export const unsubscribeAllDependencies = (key: string) => {
  const mem = getMemory<EffectMemory | SelectorMemory>(key);
  if (!mem) return;
  if (!('dependencies' in mem)) return;

  for (let depKey of mem.dependencies.values()) {
    const depMem = getMemory<AtomMemory | SelectorMemory>(depKey);
    if (!depMem) return;
    if (!('subscribers' in depMem)) return;
    depMem.subscribers.delete(key);
  }
  mem.dependencies.clear();
};

export const getAllLivingMemory = <T extends MemoryBase>(): T[] => {
  return [...globalMemory.values()]
    .map((ref) => ref.deref())
    .filter((maybeVal) => maybeVal !== undefined) as T[];
};

const contextStack: string[] = [];
export const pushReactiveContext = (key: string) => contextStack.push(key);
export const popReactiveContext = () => contextStack.pop();
export const registerDependency = (key: string) =>
  subscribeTo(key, contextStack[contextStack.length - 1]);

export const getNextAutoKey = (
  (nextAutoKey = 1) =>
  () =>
    `${AUTO_KEY_PREFIX}_${nextAutoKey++}`
)();
