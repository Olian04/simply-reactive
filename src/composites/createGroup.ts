import type { ImplementsGet } from '../types/traits/ImplementsGet';
import type { ImplementsSubscribe } from '../types/traits/ImplementsSubscribe';
import type { Group } from '../types/Group';

import { getNextAutoKey } from '../globals';
import { createAtom } from '../primitives/createAtom';
import { createSelector } from '../primitives/createSelector';

export const createGroup = <
  Id extends string | number,
  Value extends ImplementsSubscribe & ImplementsGet<unknown>
>(props: {
  key?: string;
  getDefault: (id: Id) => Value;
}): Group<Id, Value> => {
  const key = props.key || getNextAutoKey();

  const Container = createAtom({
    key: `${key}_group_container`,
    default: {} as { [k in Id]: Value },
  });

  const SubscribeTarget = createSelector({
    key: `${key}_group_subscribe_target`,
    get: () => {
      const arr = Container.get(); // Subscribe to the container
      Object.values<Value>(arr).forEach((V) => {
        V.get(); // Subscribe to each value in the container
      });
    },
  });

  return {
    key,
    subscribe: SubscribeTarget.subscribe,
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
