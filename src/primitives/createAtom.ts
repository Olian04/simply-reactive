import type { Atom } from '../types/Atom.js';
import type { AtomMemory } from '../types/memory/AtomMemory.js';
import type { AtomProps } from '../types/props/AtomProps.js';

import { registerDependency } from '../globals/contextStack.js';
import { getNextAutoKey } from '../globals/autoKey.js';
import { getMemoryOrDefault } from '../globals/memory.js';
import { notifyLivingSubscribers } from '../globals/subscribe.js';

/**
 * Returns an atomic piece of reactive state.
 */
export const createAtom = <T>(props: AtomProps<T>): Atom<T> => {
  const key = props?.key || getNextAutoKey();
  const mem = getMemoryOrDefault<AtomMemory>(key, () => ({
    key,
    value: props.default,
    subscribers: new Set<string>(),
  }));

  const api = {
    key,
    set: (valueOrFunction: T | ((oldValue: T) => T)) => {
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as (oldValue: T) => T;
        mem.value = func(mem.value as T);
      } else {
        mem.value = valueOrFunction;
      }
      notifyLivingSubscribers(key);
    },
    get: () => {
      registerDependency(key);
      return mem.value as T;
    },
    subscribe: (id: string) => {
      mem.subscribers.add(id);
    },
  };

  return api;
};
