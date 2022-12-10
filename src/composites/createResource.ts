import type { Resource } from '../types/Resource';

import { getNextAutoKey, INTERNAL_KEY_PREFIX } from '../globals';
import { createAtom } from '../primitives/createAtom';
import { createSelector } from '../primitives/createSelector';

export const createResource = <T extends Promise<unknown>>(props: {
  key?: string;
  get: () => T;
}): Resource<T> => {
  const key = props.key || getNextAutoKey();

  const RequestInvalidator = createAtom({
    key: `${INTERNAL_KEY_PREFIX}${key}_invalidator`,
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
    key,
    get: InnerSelector.get,
    subscribe: InnerSelector.subscribe,
    invalidate: () => RequestInvalidator.set((v) => v + 1),
  };
};
