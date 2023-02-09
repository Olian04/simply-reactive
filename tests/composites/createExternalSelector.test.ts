import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createSelector } from '../../src/primitives/createSelector';
import { createExternalSelector } from '../../src/composites/createExternalSelector';
import { createAtom } from '../../src/primitives/createAtom';

describe('createExternalSelector', () => {
  it('should create exactly two memory entries per external selector', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const A = createExternalSelector({
        default: 0,
        setup: set => {},
      });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      A.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(2);
      expect(afterDestruction - start).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const A = createExternalSelector({
        default: 0,
        setup: set => {},
      });
      const B = createExternalSelector({
        key: A.key,
        default: 0,
        setup: set => {},
      });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      A.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(2);
      expect(afterDestruction - start).to.equal(1);
    }
  });

  it('can be subscribed to', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createExternalSelector({
        default: 0,
        setup: set => {
          setImmediate(() => {
            set(1);
          });
        },
      });

      const B = createSelector({
        get: () => A.get() * 2,
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(B.get()).to.equal(2);
      expect(A.get()).to.equal(1);
    }
  });
});
