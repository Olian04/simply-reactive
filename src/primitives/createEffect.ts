import type { EffectMemory } from '../types/EffectMemory';

import {
  deleteMemory,
  getMemoryOrDefault,
  getNextAutoKey,
  popReactiveContext,
  pushReactiveContext,
  unsubscribeFromAll,
} from '../globals';

/**
 * Creates an eagerly evaluated synchronous or asynchronous effect that re-runs whenever the values of its dependencies change.
 * Changes to dependencies will enqueue the effect to run once the debounce duration has passed and the event queue is empty.
 * Further changes made before the effect runs will debounce the effect again.
 *
 * @param {number} debounceDuration The minimum number of milliseconds to wait before running the effect once a change has been detected. Setting the debounceDuration to `-1` will disable the debounce behavior entirely.
 */
export const createEffect = (
  notifyCallback: () => void,
  config?: Partial<{ debounceDuration: number; key: string }>
) => {
  const key = config?.key || getNextAutoKey();
  let mem = getMemoryOrDefault<EffectMemory>(key, () => ({
    key,
    notifyTimeoutId: undefined,
    debounceDuration: config?.debounceDuration ?? 0,
    onDependencyChange: () => {
      if (mem.debounceDuration === -1) {
        runNotify();
        return;
      }
      clearTimeout(mem.notifyTimeoutId);
      mem.notifyTimeoutId = setTimeout(runNotify, mem.debounceDuration);
    },
  }));

  const runNotify = () => {
    unsubscribeFromAll(key);
    pushReactiveContext(key);
    notifyCallback();
    popReactiveContext();
  };

  runNotify();

  return () => {
    if (mem === null) {
      // Attempting to destroy effect more than once
      return;
    }

    unsubscribeFromAll(key);
    clearTimeout(mem.notifyTimeoutId);
    deleteMemory(key);

    mem.notifyTimeoutId = undefined;
    mem.onDependencyChange = null;

    //@ts-ignore
    mem = null;
  };
};
