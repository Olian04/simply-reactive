import type { EffectMemory } from '../types/EffectMemory';

import {
  getNextAutoKey,
  globalMemory,
  popReactiveContext,
  pushReactiveContext,
} from '../globals';
import { CleanupStrategy } from '../types/CleanupStrategy';

/**
 * Creates an eagerly evaluated synchronous or asynchronous effect that re-runs whenever the values of its dependencies change.
 * Changes to dependencies will enqueue the effect to run once the debounce duration has passed and the event queue is empty.
 * Further changes made before the effect runs will debounce the effect again.
 *
 * @param {number} debounceDuration The minimum number of milliseconds to wait before running the effect once a change has been detected. Setting the debounceDuration to `-1` will disable the debounce behavior entirely.
 */
export const createEffect = (
  (mem: Record<string, EffectMemory>) =>
  (
    notifyCallback: () => void,
    config?: Partial<{ debounceDuration: number; key: string }>
  ) => {
    const key = config?.key || getNextAutoKey();
    if (!(key in mem)) {
      mem[key] = {
        notifyTimeoutId: undefined,
        debounceDuration: config?.debounceDuration ?? 0,
        unsubscribeFunctions: [],
      };
    }
    const unsubscribeFromDependencies = () => {
      mem[key].unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      mem[key].unsubscribeFunctions = [];
    };
    const runNotify = () => {
      unsubscribeFromDependencies();
      pushReactiveContext({
        registerDependency: (subscribe) => {
          const unsubscribe = subscribe(key, () => {
            if (mem[key].debounceDuration === -1) {
              runNotify();
              return;
            }
            clearTimeout(mem[key].notifyTimeoutId);
            mem[key].notifyTimeoutId = setTimeout(
              runNotify,
              mem[key].debounceDuration
            );
          });
          mem[key].unsubscribeFunctions.push(unsubscribe);
        },
      });
      notifyCallback();
      popReactiveContext();
    };
    runNotify();

    return (
      debounceCleanupStrategy: CleanupStrategy = CleanupStrategy.Discard
    ) => {
      if (mem[key] === undefined) {
        // Attempting to destroy effect more than once
        return;
      }
      const flush = () => {
        notifyCallback();
      };
      const clean = () => {
        unsubscribeFromDependencies();
        clearTimeout(mem[key].notifyTimeoutId);

        //GC: Cleanup potential outside references
        mem[key].notifyTimeoutId = undefined;
        mem[key].debounceDuration = 0;
        mem[key].unsubscribeFunctions = [];
        delete mem[key];
      };
      switch (debounceCleanupStrategy) {
        case CleanupStrategy.Discard:
          clean();
          break;
        case CleanupStrategy.Flush:
          flush();
          clean();
          break;
        case CleanupStrategy.FlushDebounced:
          clearTimeout(mem[key].notifyTimeoutId);
          setTimeout(() => {
            flush();
            clean();
          }, 0);
        default:
          throw new Error(
            `Unknown DebounceCleanupStrategy: ${debounceCleanupStrategy}`
          );
      }
    };
  }
)(globalMemory as Record<string, EffectMemory>);
