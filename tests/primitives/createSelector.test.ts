import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';

import { createAtom } from '../../src/primitives/createAtom';
import { createSelector } from '../../src/primitives/createSelector';
import { visualizeDependencyGraph } from '../../src/utils/visualizeDependencyGraph';
import { globalMemory } from '../../src/globals';

describe('createSelector', () => {
  afterEach(() => {
    Object.keys(globalMemory).forEach((key) => {
      delete globalMemory[key];
    });
  });

  it('should create exactly one memory entry per selector', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createSelector({
        get: () => 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createSelector({
        get: () => 0,
      });
      const B = createSelector({
        key: A.key,
        get: () => 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should be able to nest selectors inside other selectors', () => {
    for (let i = 0; i < 10; i++) {
      const Outer = createAtom({
        default: 1,
      });
      const Inner = createAtom({
        default: 1,
      });

      const before = Object.keys(globalMemory).length;

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
      expect(Object.keys(globalMemory).length - before).to.equal(2, 'first');

      Inner.set(2);
      A.get().get();
      expect(Object.keys(globalMemory).length - before).to.equal(2, 'second');

      Outer.set(2);
      A.get().get();
      expect(Object.keys(globalMemory).length - before).to.equal(2, 'third');

      Inner.set(3);
      A.get().get();
      expect(Object.keys(globalMemory).length - before).to.equal(2, 'fourth');

      expect(A.get().get()).to.equal(5);
      console.log(visualizeDependencyGraph());
    }
  });

  it('should be able to subscribe to changes', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createSelector({
        get: () => A.get() * 2,
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        B.subscribe('test', resolve);
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 0);
      });

      try {
        A.set(2);
        await awaitable;
        expect(B.get()).to.equal(4);
      } catch {
        expect.fail('Subscriber never notified change');
      }
    }
  });
});
