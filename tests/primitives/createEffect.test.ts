import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';

import { createEffect } from '../../src/primitives/createEffect';
import { globalMemory } from '../../src/globals';

describe('createEffect', () => {
  afterEach(() => {
    Object.keys(globalMemory).forEach((key) => {
      delete globalMemory[key];
    });
  });

  it('should create exactly one memory entry per effect', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const key = `effect_${i}`;
      createEffect(() => {}, { key });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const key = `effect_${i}`;
      createEffect(() => {}, { key });
      createEffect(() => {}, { key });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });
});
