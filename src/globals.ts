import type { ReactiveContext } from './types/ReactiveContext';
import { MemoryBase } from './types/MemoryBase';
import { SelectorMemory } from './types/SelectorMemory';
import { AtomMemory } from './types/AtomMemory';
import { EffectMemory } from './types/EffectMemory';

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

const getMemory = <T extends MemoryBase>(key: string) => {
  return globalMemory.get(key)?.deref() as T | undefined;
};

export const notifyLivingSubscribers = (key: string) => {
  const mem = getMemory<AtomMemory | SelectorMemory>(key);
  if (!mem) return;
  if (!('subscribers' in mem)) return;

  for (const subKey of mem.subscribers) {
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

export const unsubscribeFromAll = (key: string) => {
  const mem = getMemory<AtomMemory | SelectorMemory>(key);
  if (!mem) return;
  if (!('subscribers' in mem)) return;
  mem.subscribers = new Set<string>();
};

export const getAllLivingMemory = <T extends MemoryBase>(): T[] => {
  return [...globalMemory.values()]
    .map((ref) => ref.deref())
    .filter((maybeVal) => maybeVal !== undefined) as T[];
};

const rootContext: ReactiveContext = {
  registerDependency: () => {},
};
const contextStack: ReactiveContext[] = [rootContext];

export const registerDependency = (subscribe: (key: string) => void) =>
  contextStack[contextStack.length - 1].registerDependency(subscribe);

export const pushReactiveContext = (context: ReactiveContext) =>
  contextStack.push(context);

export const popReactiveContext = () => contextStack.pop();

export const getNextAutoKey = (
  (nextAutoKey = 1) =>
  () =>
    `_${nextAutoKey++}`
)();
