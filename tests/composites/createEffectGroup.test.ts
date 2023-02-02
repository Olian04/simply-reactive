import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createEffectGroup } from '../../src/composites/createEffectGroup';

describe('createEffectGroup', () => {
  it('should create exactly one memory entry per effect', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const key = `effect_${i}`;
      const EffectGroup = createEffectGroup([() => {}, () => {}, () => {}], {
        key,
      });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      EffectGroup.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(3);
      expect(afterDestruction - start).to.equal(0);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const key = `effect_${i}`;
      createEffectGroup([() => {}, () => {}, () => {}], {
        key,
      });
      const EffectGroup = createEffectGroup([() => {}, () => {}, () => {}], {
        key,
      });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      EffectGroup.destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(3);
      expect(afterDestruction - start).to.equal(0);
    }
  });
});
