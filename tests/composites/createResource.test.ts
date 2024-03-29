import { describe, it, expect } from 'vitest';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createAtom } from '../../src/primitives/createAtom';
import { createEffect } from '../../src/primitives/createEffect';
import { createResource } from '../../src/composites/createResource';

describe('createResource', () => {
  it('should create exactly two memory entries per resource', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createResource({
        get: async () => 0,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(2);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createResource({
        get: async () => 0,
      });
      const B = createResource({
        key: A.key,
        get: async () => 0,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(2);
    }
  });

  it('can be subscribed to', async () => {
    const A = createAtom({
      default: 0,
    });

    for (let i = 0; i < 10; i++) {
      A.set(0);
      const B = createResource({
        get: async () => A.get() * 2,
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        const Effect = createEffect(async () => {
          if ((await B.get()) === 0) return;
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
      expect(await B.get()).to.equal(4);
    }
  });

  it('can be invalidated', async () => {
    for (let i = 0; i < 10; i++) {
      let c = 0;
      const B = createResource({
        get: async () => c++,
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        const Effect = createEffect(async () => {
          if ((await B.get()) === c) return;
          resolve();
        });
        setTimeout(() => {
          Effect.destroy();
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        B.invalidate();
        await awaitable;
      } catch {
        expect.fail('Subscriber never notified change');
      }
      expect(await B.get()).to.equal(1);
    }
  });
});
