import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';

import { createAtom } from '../../src/primitives/createAtom';
import { globalMemory } from '../../src/globals';

describe('createAtom', () => {
  afterEach(() => {
    Object.keys(globalMemory).forEach((key) => {
      delete globalMemory[key];
    });
  });

  it('should create exactly one memory entry per atom', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createAtom({
        default: 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createAtom({
        default: 0,
      });
      const B = createAtom({
        key: A.key,
        default: 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should be able to nest atoms inside other atoms', () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: createAtom({
          default: 1,
        }),
      });

      expect(A.get().get()).to.equal(1);
    }
  });

  it('should be able to update the value by passing a new value to set', () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });

      A.set(42);
      expect(A.get()).to.equal(42);

      A.set(0);
      expect(A.get()).to.equal(0);

      A.set(-42);
      expect(A.get()).to.equal(-42);
    }
  });

  it('should be able to update the value by passing a function to set', () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });

      A.set((v) => v + 42);
      expect(A.get()).to.equal(42);

      A.set((v) => v + 0);
      expect(A.get()).to.equal(42);

      A.set((v) => v - 42);
      expect(A.get()).to.equal(0);
    }
  });

  it('should be able to subscribe to changes', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        A.subscribe('test', resolve);
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 0);
      });

      try {
        A.set(2);
        await awaitable;
        expect(A.get()).to.equal(2);
      } catch {
        expect.fail('Subscriber never notified change');
      }
    }
  });
});
