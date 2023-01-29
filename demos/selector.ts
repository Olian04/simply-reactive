import { createAtom, createSelector } from '../src/api';
import { getAllLivingMemory } from '../src/globals/memory';
import { ImplementsGet } from '../src/types/traits/ImplementsGet';
import { ImplementsSubscribe } from '../src/types/traits/ImplementsSubscribe';

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
