import type { Selector } from '../types/Selector';
import type { SelectorMemory } from '../types/SelectorMemory';
import type { SelectorProps } from '../types/SelectorProps';

import {
  registerDependency,
  pushReactiveContext,
  popReactiveContext,
} from '../globals/contextStack';
import { getNextAutoKey } from '../globals/autoKey';
import { getMemoryOrDefault } from '../globals/memory';
import { unsubscribeAllDependencies } from '../globals/subscribe';

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
    dependencies: new Set<string>(),
  }));

  const api = {
    key,
    get: () => {
      registerDependency(key);

      if (mem.isDirty) {
        unsubscribeAllDependencies(key);
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
