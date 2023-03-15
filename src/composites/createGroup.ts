import type { GroupProps } from '../types/props/GroupProps';
import type { Group } from '../types/Group';

import { getNextAutoKey } from '../globals/autoKey';
import { createAtom } from '../primitives/createAtom';

export const createGroup = <T>(props: GroupProps<T>): Group<T> => {
  const key = props.key || getNextAutoKey();

  const Container = createAtom({
    key,
    default: {} as {
      [k in string]: T;
    },
  });

  return {
    key,
    subscribe: Container.subscribe,
    get: () => Object.keys(Container.get()),
    find: (id) => {
      const strId = String(id);
      if (!(strId in Container.get())) {
        Container.set((container) => {
          container[strId] = props.getDefault(strId);
          return container;
        });
      }
      return Container.get()[strId];
    },
    remove: (id) => {
      const strId = String(id);
      if (strId in Container.get()) {
        Container.set((container) => {
          delete container[strId];
          return container;
        });
      }
    },
    clear: () => Container.set({}),
  };
};
