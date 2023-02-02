import {
  createAtom,
  createSelector,
  ImplementsGet,
  ImplementsSubscribe,
} from '../dist/api';
import { getAllLivingMemory } from '../dist/globals/memory';

const Count = createAtom({
  default: 0,
});

setInterval(() => {
  const Sequence = Array(5000)
    .fill(0)
    .reduce(
      (Prev: ImplementsGet<number> & ImplementsSubscribe, _) =>
        createSelector({
          get: () => {
            return Prev.get() + 1;
          },
        }),
      Count
    );
  console.time();
  Count.set((v) => v + 1);
  console.log(Sequence.get(), getAllLivingMemory().length);
  console.timeEnd();
}, 1000);
