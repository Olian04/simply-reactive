import type { Selector } from "./types/Selector";
import type { SelectorMemory } from "./types/SelectorMemory";
import type { SelectorProps } from "./types/SelectorProps";
import type { SynchronousGettable } from "./types/SynchronousGettable";

import { globalMemory } from "./globals";

/**
 * Returns a lazy evaluated synchronous selector that only re-evaluates when the values of its dependencies change.
 */
export const createSelector = ((mem: Record<string, SelectorMemory>) => <T>(props: SelectorProps<T>): Selector<T> => {
  const onDependencyChanged = () => {
    mem[props.key].isDirty = true;
    Object.values(mem[props.key].subscribers)
      .forEach(notifyCallback => notifyCallback());
  };
  const getDependency = <R>(gettable: SynchronousGettable<R>) => {
    const unsubscribe = gettable.subscribe(props.key, onDependencyChanged);
    mem[props.key].unsubscribeFunctions.push(unsubscribe);
    return gettable.get();
  };
  if (!(props.key in mem)) {
    mem[props.key] = {
      value: null,
      isDirty: true,
      subscribers: {},
      unsubscribeFunctions: [],
    };
  }
  const api = {
    key: props.key,
    get: () => {
      if (mem[props.key].isDirty) {
        mem[props.key].unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        mem[props.key].unsubscribeFunctions = [];
        mem[props.key].value = props.get({
          get: getDependency,
        });
        mem[props.key].isDirty = false;
      }
      return mem[props.key].value as T;
    },
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[props.key].subscribers[id] = notifyCallback;
      return () => {
        delete mem[props.key].subscribers[id];
      };
    },
  };
  return api;
})(globalMemory as Record<string, SelectorMemory>);
