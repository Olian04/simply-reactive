import { expect } from 'chai';
import { createAtom, createSelector } from 'simply-reactive';

const A = createAtom({
  default: 3,
});

const B = createSelector({
  get: () => A.get() * 2,
});

expect(B.get()).to.equal(6);
