import type { Atom } from "../types/Atom";
import type { AtomMemory } from "../types/AtomMemory";
import type { AtomProps } from "../types/AtomProps";

import { getNextAutoGet, globalMemory, registerDependency } from "../globals";

/**
 * Returns an atomic piece of reactive state.
 */
export const createAtom = ((mem: Record<string, AtomMemory>) => <T>(props: AtomProps<T>): Atom<T> => {
  const key = String(props?.key || getNextAutoGet());
  if (!(key in mem)) {
    mem[key] = {
      value: props.default,
      subscribers: {},
    };
  }
  const api = {
    key: key,
    set: (valueOrFunction: T | ((oldValue: T) => T)) => {
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as ((oldValue: T) => T);
        mem[key].value = func(mem[key].value as T);
      } else {
        mem[key].value = valueOrFunction;
      }
      Object.values(mem[key].subscribers)
        .forEach(notifyCallback => notifyCallback());
    },
    get: () => {
      registerDependency(api.subscribe);
      return mem[key].value as T;
    },
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[key].subscribers[id] = notifyCallback;
      return () => {
        delete mem[key].subscribers[id];
      };
    },
  };
  return api;
})(globalMemory as Record<string, AtomMemory>);
