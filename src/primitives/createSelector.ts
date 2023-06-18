import type { Selector } from '../types/Selector.js';
import type { SelectorMemory } from '../types/memory/SelectorMemory.js';
import type { SelectorProps } from '../types/props/SelectorProps.js';
import type { Serializeable } from '../types/util/Serializeable.js';

import {
  registerDependency,
  pushReactiveContext,
  popReactiveContext,
} from '../globals/contextStack.js';
import { getNextAutoKey } from '../globals/autoKey.js';
import { getMemoryOrDefault } from '../globals/memory.js';
import { unsubscribeAllDependencies } from '../globals/subscribe.js';

/**
 * Returns a lazily evaluated selector that only re-evaluates when the values of its dependencies change.
 */
export const createSelector = <T extends Serializeable>(
  props: SelectorProps<T>
): Selector<T> => {
  const key = props?.key || getNextAutoKey();
  const mem = getMemoryOrDefault<SelectorMemory>(key, () => ({
    key,
    value: null,
    valueHash: '',
    valueHashMap: {},
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
