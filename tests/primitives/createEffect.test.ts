import { describe, it, expect } from 'vitest';

import type { Effect } from '../../src/types/Effect';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createEffect } from '../../src/primitives/createEffect';
import { createAtom } from '../../src/primitives/createAtom';
import { createSelector } from '../../src/primitives/createSelector';

describe('createEffect', () => {
  it('should create exactly one memory entry per effect', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const Effect = createEffect(() => { }, { key: `effect_${i}` });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      Effect.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(1);
      expect(afterDestruction - start).to.equal(0);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const key = `effect_${i}`;
      createEffect(() => { }, { key });
      const Effect = createEffect(() => { }, { key });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      Effect.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(1);
      expect(afterDestruction - start).to.equal(0);
    }
  });

  it('can subscribe to atom', async () => {
    const A = createAtom({
      default: 0,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(() => {
          if (A.get() === 0) return;
          resolve();
        }, {});
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });

  it('can subscribe to atom when reusing key', async () => {
    const A = createAtom({
      default: 0,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(
          () => {
            if (A.get() === 0) return;
            resolve();
          },
          { key: 'test' }
        );
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });

  it('can subscribe to selector', async () => {
    const A = createAtom({
      default: 0,
    });
    const B = createSelector({
      get: () => A.get() * 2,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(() => {
          if (B.get() === 0) return;
          resolve();
        }, {});
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });

  it('can subscribe to selector when reusing key', async () => {
    const A = createAtom({
      default: 0,
    });
    const B = createSelector({
      get: () => A.get() * 2,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(
          () => {
            if (B.get() === 0) return;
            resolve();
          },
          { key: 'test' }
        );
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });

  it('should execute cleanup function on destroy if provided one', async () => {
    for (let i = 0; i < 10; i++) {
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(
          () => () => resolve(),
          { key: 'test' }
        );
        Effect.destroy();
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });

  it('should execute cleanup function before notify if provided one', async () => {
    const A = createAtom({
      default: 0,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      let Effect: Effect = null as any as Effect;
      const awaitable = new Promise<void>((resolve, reject) => {
        Effect = createEffect(
          () => {
            A.get();
            return () => resolve();
          },
          { key: 'test' }
        );
        A.set(1);
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      } finally {
        Effect?.destroy();
      }
    }
  });
});
