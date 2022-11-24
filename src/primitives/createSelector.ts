import type { Selector } from '../types/Selector';
import type { SelectorMemory } from '../types/SelectorMemory';
import type { SelectorProps } from '../types/SelectorProps';

import {
  getMemoryOrDefault,
  registerDependency,
  pushReactiveContext,
  popReactiveContext,
  getNextAutoKey,
  unsubscribeFromAll,
  notifyLivingSubscribers,
} from '../globals';

/**
 * Returns a lazy evaluated synchronous selector that only re-evaluates when the values of its dependencies change.
 */
export const createSelector = <T>(props: SelectorProps<T>): Selector<T> => {
  const key = props?.key || getNextAutoKey();
  const mem = getMemoryOrDefault<SelectorMemory>(key, () => ({
    key,
    value: null,
    isDirty: true,
    subscribers: new Set<string>(),
  }));

  const api = {
    key,
    get: () => {
      registerDependency(key);

      if (mem.isDirty) {
        unsubscribeFromAll(key);
        pushReactiveContext(key);
        mem.isDirty = false;
        mem.value = props.get();
        popReactiveContext();
      }

      return mem.value as T;
    },
    subscribe: (id: string) => {
      mem.subscribers.add(id);
    },
  };

  return api;
};
