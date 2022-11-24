import type { Atom } from '../types/Atom';
import type { AtomMemory } from '../types/AtomMemory';
import type { AtomProps } from '../types/AtomProps';

import {
  getMemoryOrDefault,
  getNextAutoKey,
  registerDependency,
} from '../globals';

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
      Object.values(mem.subscribers).forEach((notifyCallback) =>
        notifyCallback()
      );
    },
    get: () => {
      registerDependency(api.subscribe);
      return mem.value as T;
    },
    subscribe: (id: string) => {
      mem.subscribers.add(id);
    },
  };

  return api;
};
