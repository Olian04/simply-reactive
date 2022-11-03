import type { Gettable } from "./types/Gettable";
import type { Resource } from "./types/Resource";
import type { ResourceMemory } from "./types/ResourceMemory";
import type { ResourceProps } from "./types/ResourceProps";

import { globalMemory } from "./globals";

/**
 * Returns a lazy evaluated asynchronous recource that only re-evaluates when the values of its dependencies change.
 */
export const createResource = ((mem: Record<string, ResourceMemory>) => <T>(props: ResourceProps<T>): Resource<T> => {
  const onDependencyChanged = () => {
    mem[props.key].isDirty = true;
    Object.values(mem[props.key].subscribers)
      .forEach(notifyCallback => notifyCallback());
  };
  const getDependency = <R>(gettable: Gettable<R>) => {
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
    get: async () => {
      if (mem[props.key].isDirty) {
        mem[props.key].unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        mem[props.key].unsubscribeFunctions = [];
        mem[props.key].value = await props.get({
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
})(globalMemory as Record<string, ResourceMemory>);
