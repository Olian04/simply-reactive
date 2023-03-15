import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getAllLivingMemory } from '../../src/globals/memory';
import { createAtom } from '../../src/primitives/createAtom';
import { createEffect } from '../../src/primitives/createEffect';
import { createGroup } from '../../src/composites/createGroup';

describe('createGroup', () => {
  it('should create exactly one memory entry per resource', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(getAllLivingMemory()).length;

      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });
      const B = createGroup({
        key: A.key,
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      const after = Object.keys(getAllLivingMemory()).length;

      expect(after - before).to.equal(1);
    }
  });

  it('can be subscribed to', async () => {
    for (let i = 0; i < 10; i++) {
      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      const awaitable = new Promise<void>((resolve, reject) => {
        const Effect = createEffect(() => {
          if (A.find(0).get() === 0) return;
          resolve();
        });
        setTimeout(() => {
          Effect.destroy();
          reject(new Error('Timeout'));
        }, 100);
      });

      try {
        A.find(0).set(2);
        await awaitable;
      } catch {
        expect.fail('Never notified change');
      }
      expect(await A.find(0).get()).to.equal(2);
    }
  });

  it('should return all keys when calling Group#get', () => {
    for (let i = 0; i < 10; i++) {
      const A = createGroup({
        getDefault: (id) =>
          createAtom({
            key: String(id),
            default: 0,
          }),
      });

      A.find(0).key;
      expect(A.get()).to.deep.equal(['0']);
      A.find(1);
      expect(A.get()).to.deep.equal(['0', '1']);
      A.find(0);
      A.find(1);
      A.find(2);
      expect(A.get()).to.deep.equal(['0', '1', '2']);
    }
  });

  it('should return the same value for string and number keys given to Group#find', () => {
    for (let i = 0; i < 10; i++) {
      const A = createGroup({
        getDefault: (id) =>
          createAtom({
            key: String(id),
            default: 0,
          }),
      });

      expect(A.find('0').key).to.equal('0');
      expect(A.find(0).key).to.equal('0');
      expect(A.find(0)).to.equal(A.find('0'));
    }
  });

  it('should remove value from group when calling Group#remove', () => {
    for (let i = 0; i < 10; i++) {
      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      expect(A.find(0).get()).to.equal(0);
      A.find(0).set(3);
      expect(A.find(0).get()).to.equal(3);
      A.remove(0);
      expect(A.find(0).get()).to.equal(0);
    }
  });

  it('should remove all values from group when calling Group#clear', () => {
    for (let i = 0; i < 10; i++) {
      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      expect(A.find(0).get()).to.equal(0);
      expect(A.find(1).get()).to.equal(0);
      expect(A.find(2).get()).to.equal(0);
      A.find(0).set(3);
      A.find(1).set(3);
      A.find(2).set(3);
      expect(A.find(0).get()).to.equal(3);
      expect(A.find(1).get()).to.equal(3);
      expect(A.find(2).get()).to.equal(3);
      A.clear();
      expect(A.find(0).get()).to.equal(0);
      expect(A.find(1).get()).to.equal(0);
      expect(A.find(2).get()).to.equal(0);
    }
  });
});
