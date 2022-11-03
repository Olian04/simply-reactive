import type { Atom } from "./types/Atom";
import type { AtomMemory } from "./types/AtomMemory";
import type { AtomProps } from "./types/AtomProps";

import { globalMemory } from "./globals";

/**
 * Returns an atomic piece of reactive state.
 */
export const createAtom = ((mem: Record<string, AtomMemory>) => <T>(props: AtomProps<T>): Atom<T> => {
  if (!(props.key in mem)) {
    mem[props.key] = {
      value: props.default,
      subscribers: {},
    };
  }
  const api = {
    key: props.key,
    set: (valueOrFunction: T | ((oldValue: T) => T)) => {
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as ((oldValue: T) => T);
        mem[props.key].value = func(mem[props.key].value as T);
      } else {
        mem[props.key].value = valueOrFunction;
      }
      Object.values(mem[props.key].subscribers)
        .forEach(notifyCallback => notifyCallback());
    },
    get: () => mem[props.key].value as T,
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[props.key].subscribers[id] = notifyCallback;
      return () => {
        delete mem[props.key].subscribers[id];
      };
    },
  };
  return api;
})(globalMemory as Record<string, AtomMemory>);
