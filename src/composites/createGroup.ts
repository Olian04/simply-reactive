import type { ImplementsGet } from '../types/traits/ImplementsGet';
import type { ImplementsSubscribe } from '../types/traits/ImplementsSubscribe';
import type { Group } from '../types/Group';

import { getNextAutoKey } from '../globals/autoKey';
import { createAtom } from '../primitives/createAtom';

export const createGroup = <
  Id extends string | number,
  Value extends ImplementsSubscribe & ImplementsGet<unknown>
>(props: {
  key?: string;
  getDefault: (id: Id) => Value;
}): Group<Id, Value> => {
  const key = props.key || getNextAutoKey();

  const Container = createAtom({
    key,
    default: {} as { [k in Id]: Value },
  });

  return {
    key,
    subscribe: Container.subscribe,
    get: () => Object.values(Container.get()),
    find: (id) => {
      if (!Container.get()[id]) {
        Container.set((container) => {
          container[id] = props.getDefault(id);
          return container;
        });
      }
      return Container.get()[id];
    },
    remove: (id) => {
      if (Container.get()[id]) {
        Container.set((container) => {
          delete container[id];
          return container;
        });
      }
    },
    clear: () => Container.set({} as ReturnType<typeof Container.get>),
  };
};
