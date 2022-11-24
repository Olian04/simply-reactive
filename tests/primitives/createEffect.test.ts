import { describe, it } from 'mocha';
import { expect } from 'chai';

import { createEffect } from '../../src/primitives/createEffect';
import { getAllLivingMemory } from '../../src/globals';

describe('createEffect', () => {
  it('should create exactly one memory entry per effect', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const key = `effect_${i}`;
      const destroy = createEffect(() => {}, { key });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(1);
      expect(afterDestruction - start).to.equal(0);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const start = Object.keys(getAllLivingMemory()).length;

      const key = `effect_${i}`;
      createEffect(() => {}, { key });
      const destroy = createEffect(() => {}, { key });

      const afterCreation = Object.keys(getAllLivingMemory()).length;

      destroy();

      const afterDestruction = Object.keys(getAllLivingMemory()).length;

      expect(afterCreation - start).to.equal(1);
      expect(afterDestruction - start).to.equal(0);
    }
  });
});
