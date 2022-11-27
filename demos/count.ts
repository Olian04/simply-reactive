import { createAtom, createEffect, createSelector } from '../dist/api.node';

const Count = createAtom({
  default: 0,
});

const DoubleCount = createSelector({
  get: () => {
    return Count.get() * 2;
  },
});

createEffect(() => {
  console.log(`${DoubleCount.get()} is twice as big as ${Count.get()}`);
});

setInterval(() => {
  Count.set((c) => c + 1);
}, 1000);
