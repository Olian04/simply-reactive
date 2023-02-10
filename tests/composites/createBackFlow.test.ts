import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createAtom } from '../../src/primitives/createAtom';
import { createBackFlow } from '../../src/composites/createBackFlow';
import { createSelector } from '../../src/primitives/createSelector';

describe('createBackFlow', () => {
  it('should create exactly one memory entry per backflow', () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createAtom({
        default: 0,
      });

      const before = Object.keys(getAllLivingMemory()).length;

      const BF = createBackFlow({
        from: A,
        to: B,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createAtom({
        default: 0,
      });

      const before = Object.keys(getAllLivingMemory()).length;

      const BF1 = createBackFlow({
        from: A,
        to: B,
      });
      const BF2 = createBackFlow({
        key: BF1.key,
        from: A,
        to: B,
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should apply changes made to "from" to "to"', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createAtom({
        default: 1,
      });

      createBackFlow({
        from: B,
        to: A,
      });


      await new Promise(resolve => setTimeout(resolve, 10));
      expect(B.get()).to.equal(1);
      expect(A.get()).to.equal(1);
    }
  });

  it('fails when circular dependency would be created', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createSelector({
        get: () => A.get(),
      });

      const BF = createBackFlow({
        from: B,
        to: A,
      });
      // expect.fail('TODO: Make sure this test can fail!!!');

    }
  });
});
