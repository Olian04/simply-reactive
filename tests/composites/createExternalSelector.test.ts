import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createAtom } from '../../src/primitives/createAtom';
import { createEffect } from '../../src/primitives/createEffect';
import { createExternalSelector } from '../../src/composites/createExternalSelector';

describe('createExternalSelector', () => {
  it('should create exactly two memory entries per external selector', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createExternalSelector({
        default: 0,
        setup: set => {},
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(2);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createExternalSelector({
        default: 0,
        setup: set => {},
      });
      const B = createExternalSelector({
        key: A.key,
        default: 0,
        setup: set => {},
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(2);
    }
  });

  it('can be subscribed to', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createExternalSelector({
        default: 0,
        setup: set => {
          setTimeout(() => set(1), 0);
        },
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        const Effect = createEffect(async () => {
          if ((await A.get()) === 1) return;
          resolve();
        });
        setTimeout(() => {
          Effect.destroy();
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      }
      expect(await A.get()).to.equal(1);
    }
  });
});
