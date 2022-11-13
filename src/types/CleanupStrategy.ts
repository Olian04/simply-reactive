/**
 * Determines how an effect should be cleaned up.
 */
export const enum CleanupStrategy {
  /**
   * Throw away and discard the effect.
   * Any changes currently queued will be ignored.
   */
  Discard = 'discard',

  /**
   * Throw away and discard the effect.
   * Any changes currently queued will be evaluated by firing the effect as its cleaned up.
   */
  Flush = 'flush',

  /**
   * Debounce the effect once with a debounce duration of `0 ms`.
   * Then throw away and discard the effect.
   * Any changes currently queued will be evaluated by firing the effect as its cleaned up.
   */
  FlushDebounced = 'flush-debounced',
}
