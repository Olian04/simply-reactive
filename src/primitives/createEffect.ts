import type { Effect } from '../types/Effect';
import type { EffectMemory } from '../types/memory/EffectMemory';
import type { EffectProps } from '../types/props/EffectProps';

import {
  pushReactiveContext,
  popReactiveContext,
} from '../globals/contextStack';
import { getNextAutoKey } from '../globals/autoKey';
import { deleteMemory, getMemoryOrDefault } from '../globals/memory';
import { unsubscribeAllDependencies } from '../globals/subscribe';

/**
 * Creates an eagerly evaluated synchronous or asynchronous effect that re-runs whenever the values of its dependencies change.
 * Changes to dependencies will enqueue the effect to run once the debounce duration has passed and the event queue is empty.
 * Further changes made before the effect runs will debounce the effect again.
 *
 * @param {number} config.debounceDuration The minimum number of milliseconds to wait before running the effect once a change has been detected. Setting the debounceDuration to `-1` will disable the debounce behavior entirely.
 */
export const createEffect = (
  notifyCallback: EffectProps.Callback,
  config?: Partial<EffectProps.Config>
): Effect => {
  const key = config?.key || getNextAutoKey();
  let mem: EffectMemory | null = null;

  const runNotify = async () => {
    unsubscribeAllDependencies(key);
    pushReactiveContext(key);
    mem?.onDestroy?.();
    const maybeCleaupCallback = await Promise.resolve(notifyCallback());
    if (maybeCleaupCallback) {
      if (mem) {
        mem.onDestroy = maybeCleaupCallback;
      } else {
        maybeCleaupCallback();
      }
    }
    popReactiveContext();
  };

  const api = {
    key,
    destroy: () => {
      if (mem === null) {
        // Attempting to destroy effect more than once
        return;
      }

      unsubscribeAllDependencies(key);
      clearTimeout(mem.notifyTimeoutId);
      deleteMemory(key);

      mem.onDestroy?.();

      mem.notifyTimeoutId = undefined;
      mem.onDependencyChange = null;
      mem.onDestroy = null;

      //@ts-ignore
      mem = null;
    },
    restore: () => {
      mem = getMemoryOrDefault<EffectMemory>(
        key,
        () => ({
          key,
          notifyTimeoutId: undefined,
          debounceDuration: config?.debounceDuration ?? 0,
          dependencies: new Set<string>(),
          onDependencyChange: () => {
            if (!mem) return;
            if (mem.debounceDuration === -1) {
              runNotify();
              return;
            }
            clearTimeout(mem.notifyTimeoutId);
            mem.notifyTimeoutId = setTimeout(runNotify, mem.debounceDuration);
          },
          onDestroy: null,
        }),
        { forceStrongMemory: true }
      );

      runNotify();
    },
  };

  if (config?.skipInit !== true) {
    api.restore();
  }

  return api;
};
