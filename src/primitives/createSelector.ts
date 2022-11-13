import type { Selector } from '../types/Selector';
import type { SelectorMemory } from '../types/SelectorMemory';
import type { SelectorProps } from '../types/SelectorProps';

import {
  globalMemory,
  registerDependency,
  pushReactiveContext,
  popReactiveContext,
  getNextAutoKey,
} from '../globals';

/**
 * Returns a lazy evaluated synchronous selector that only re-evaluates when the values of its dependencies change.
 */
export const createSelector = (
  (mem: Record<string, SelectorMemory>) =>
  <T>(props: SelectorProps<T>): Selector<T> => {
    const key = props?.key || getNextAutoKey();
    const onDependencyChanged = () => {
      mem[key].isDirty = true;
      Object.values(mem[key].subscribers).forEach((notifyCallback) =>
        notifyCallback()
      );
    };
    if (!(key in mem)) {
      mem[key] = {
        value: null,
        isDirty: true,
        subscribers: {},
        unsubscribeFunctions: [],
      };
    }
    const api = {
      key: key,
      get: () => {
        registerDependency(api.subscribe);

        if (mem[key].isDirty) {
          // Clean up previous dependencies
          mem[key].unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
          mem[key].unsubscribeFunctions = [];

          // Collect new dependencies and calculate new value
          pushReactiveContext({
            registerDependency: (subscribe) => {
              const unsubscribe = subscribe(key, onDependencyChanged);
              mem[key].unsubscribeFunctions.push(unsubscribe);
            },
          });
          mem[key].value = props.get();
          mem[key].isDirty = false;
          popReactiveContext();
        }

        return mem[key].value as T;
      },
      subscribe: (id: string, notifyCallback: () => void) => {
        mem[key].subscribers[id] = notifyCallback;
        return () => {
          delete mem[key].subscribers[id];
        };
      },
    };
    api.get(); // Run get eagerly on creation in order to register the selectors dependencies
    return api;
  }
)(globalMemory as Record<string, SelectorMemory>);