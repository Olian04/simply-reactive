import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';

import { createAtom } from '../../src/primitives/createAtom';
import { createGroup } from '../../src/composites/createGroup';
import { globalMemory } from '../../src/globals';

describe('createGroup', () => {
  afterEach(() => {
    Object.keys(globalMemory).forEach((key) => {
      delete globalMemory[key];
    });
  });

  it('should create exactly two memory entries per resource', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

      const A = createGroup({
        getDefault: () =>
          createAtom({
            default: 0,
          }),
      });

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(2);
    }
  });

  it('should reuse the same memory if the same key is used again', () => {
    for (let i = 0; i < 10; i++) {
      const before = Object.keys(globalMemory).length;

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

      const after = Object.keys(globalMemory).length;

      expect(after - before).to.equal(2);
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
        A.subscribe('test', resolve);
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 0);
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

  it('should write tests for "get"', () => {
    expect.fail(`Still need to test "get"`);
  });

  it('should write tests for "find"', () => {
    expect.fail(`Still need to test "find"`);
  });

  it('should write tests for "remove"', () => {
    expect.fail(`Still need to test "remove"`);
  });

  it('should write tests for "clear"', () => {
    expect.fail(`Still need to test "clear"`);
  });
});
