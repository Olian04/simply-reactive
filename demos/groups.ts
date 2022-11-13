import { createGroup, createAtom, createSelector } from '../src/api';

const CountGroup = createGroup({
  getDefault: () =>
    createAtom({
      default: 0,
    }),
});
CountGroup.find(0).set(5);
CountGroup.find(1).set(2);
console.log(CountGroup.find(0).get());
console.log(CountGroup.find(1).get());

const DoubleCountGroup = createGroup({
  getDefault: (index) =>
    createSelector({
      get: () => CountGroup.find(index).get() * 2,
    }),
});

console.log(DoubleCountGroup.find(0).get());
console.log(DoubleCountGroup.find(1).get());
