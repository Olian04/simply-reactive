import type { EffectMemory } from "./types/EffectMemory";
import type { Gettable } from "./types/Gettable";
import type { Getter } from "./types/Getter";

import { globalMemory } from "./globals";

/**
 * Creates an eagerly evaluated synchronous or asynchronous effect that re-runs whenever the values of its dependencies change.
 * Changes to dependencies will enqueue the effect to run once the debounce duration has passed and the event queue is empty.
 * Further changes made before the effect runs will debounce the effect again.
 * 
 * @param {number} debounceDuration The minimum number of milliseconds to wait before running the effect once a change has been detected. Setting the debounceDuration to `-1` will disable the debounce behavior entirely.
 */
 export const createEffect = ((mem: Record<string, EffectMemory>, nextAutoKey = 1) => (notifyCallback: (ctx: { get: Getter }) => void, config?: Partial<{ debounceDuration: number, key: string }>) => {
  const key = String(config?.key || nextAutoKey++);
  if (!(key in mem)) {
    mem[key] = {
      notifyTimeoutId: undefined,
      debounceDuration: config?.debounceDuration ?? 0,
      unsubscribeFunctions: [],
    };
  }
  const getDependency = <T,>(gettable: Gettable<T>) => {
  	gettable.subscribe(key, () => {
      if (mem[key].debounceDuration === -1) {
        runNotify();
        return;
      }
  		clearTimeout(mem[key].notifyTimeoutId);
    	mem[key].notifyTimeoutId = setTimeout(runNotify, mem[key].debounceDuration);
    });
    return gettable.get();
  };
  const runNotify = () => {
   notifyCallback({
     get: getDependency,
   });
  }
  runNotify();
})(globalMemory as Record<string, EffectMemory>);
