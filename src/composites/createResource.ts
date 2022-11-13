import { getNextAutoKey } from '../globals';
import { createAtom } from '../primitives/createAtom';
import { createSelector } from '../primitives/createSelector';

export const createResource = <T extends Promise<unknown>>(props: {
  key?: string;
  get: () => T;
}) => {
  const key = props.key || getNextAutoKey();

  const RequestInvalidator = createAtom({
    key: `${key}_invalidator`,
    default: 0,
  });

  const InnerSelector = createSelector<T>({
    key: key,
    get: () => {
      RequestInvalidator.get();
      return props.get();
    },
  });

  return {
    key: key,
    get: InnerSelector.get,
    subscribe: InnerSelector.subscribe,
    invalidate: () => RequestInvalidator.set((v) => v + 1),
  };
};
