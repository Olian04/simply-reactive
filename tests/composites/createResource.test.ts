import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';

import { createAtom } from '../../src/primitives/createAtom';
import { createResource } from '../../src/composites/createResource';
import { globalMemory } from '../../src/globals';

describe('createResource', () => {
  afterEach(() => {
    Object.keys(globalMemory).forEach((key) => {
      delete globalMemory[key];
    });
  });

  it('should create exactly two memory entries per resource', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createResource({
        get: async () => 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(2);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createResource({
        get: async () => 0,
      });
      const B = createResource({
        key: A.key,
        get: async () => 0,
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(2);
    }
  });

  it('can be subscribed to', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createAtom({
        default: 0,
      });
      const B = createResource({
        get: async () => A.get() * 2,
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
        B.subscribe('test', resolve);
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 0);
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
