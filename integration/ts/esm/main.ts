import { expect } from 'chai';
import { createAtom, createSelector } from 'simply-reactive/core';
import { ImplementsGet } from 'simply-reactive/traits';
import { visualizeDependencyGraph } from 'simply-reactive/utils';
import { createGroup } from 'simply-reactive/composites';

const A = createAtom({
  default: 3,
});

const B = createSelector({
  get: () => A.get() * 2,
});

expect(B.get()).to.equal(6);
