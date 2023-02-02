import type { MemoryBase } from '../types/MemoryBase';
import type { SelectorMemory } from '../types/SelectorMemory';
import type { AtomMemory } from '../types/AtomMemory';
import type { EffectMemory } from '../types/EffectMemory';

import { getMemory } from './memory';

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
