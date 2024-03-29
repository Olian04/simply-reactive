import { describe, it, expect } from 'vitest';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createAtom } from '../../src/primitives/createAtom';
import { createEffect } from '../../src/primitives/createEffect';
import { createSelector } from '../../src/primitives/createSelector';

describe('createSelector', () => {
  it('should create exactly one memory entry per selector', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createSelector({
        get: () => 0,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createSelector({
        get: () => 0,
      });
      const B = createSelector({
        key: A.key,
        get: () => 0,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should be able to nest selectors inside other selectors', () => {
    const Outer = createAtom({
      default: 1,
    });
    const Inner = createAtom({
      default: 1,
    });

    for (let i = 0; i < 10; i++) {
      Outer.set(1);
      Inner.set(1);
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createSelector({
        get: () => {
          const outer = Outer.get();
          return createSelector({
            key: `inner_${i}`,
            get: () => outer + Inner.get(),
          });
        },
      });

      A.get().get();
      expect(Object.keys(getAllLivingMemory()).length - before).to.equal(
        2,
        'first'
      );

      Inner.set(2);
      A.get().get();
      expect(Object.keys(getAllLivingMemory()).length - before).to.equal(
        2,
        'second'
      );

      Outer.set(2);
      A.get().get();
      expect(Object.keys(getAllLivingMemory()).length - before).to.equal(
        2,
        'third'
      );

      Inner.set(3);
      A.get().get();
      expect(Object.keys(getAllLivingMemory()).length - before).to.equal(
        2,
        'fourth'
      );

      expect(A.get().get()).to.equal(5);
    }
  });

  it('can be subscribed to', async () => {
    const A = createAtom({
      default: 0,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      const B = createSelector({
        get: () => A.get() * 2,
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        const Effect = createEffect(() => {
          if (B.get() === 0) return;
          resolve();
        });
        setTimeout(() => {
          Effect.destroy();
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      }
      expect(B.get()).to.equal(4);
    }
  });

  it('can be async', async () => {
    for (let i = 0; i < 10; i++) {
      const B = createSelector({
        get: async () => 0,
      });

      expect(B.get()).to.be.instanceOf(Promise);
      expect(await B.get()).to.equal(0);
    }
  });
});
