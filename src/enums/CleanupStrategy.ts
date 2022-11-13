/**
 * Determines how to cleanup any queued changes or async operatons.
 */
export const enum CleanupStrategy {
  /**
   * Throw away and discard any queued changes or async operatons.
   */
  Discard = 'discard',

  /**
   * Apply any queued changes synchronously, throw away any async operations.
   */
  Flush = 'flush-sync',

  /**
   * Await and apply any queued changes and async operations.
   */
  FlushAsync = 'flush-async',
}
