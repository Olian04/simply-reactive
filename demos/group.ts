import { createGroup, createAtom, createSelector } from '../dist/api.node';

const CountGroup = createGroup({
  getDefault: () =>
    createAtom({
      default: 0,
    }),
});

const DoubleCountGroup = createGroup({
  getDefault: (index) =>
    createSelector({
      get: () => CountGroup.find(index).get() * 2,
    }),
});

CountGroup.find(0).set(5);
CountGroup.find(1).set(2);
console.log(DoubleCountGroup.find(0).get());
console.log(DoubleCountGroup.find(1).get());
console.log(DoubleCountGroup.find(2).get());
