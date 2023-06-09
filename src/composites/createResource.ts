import type { ResourceProps } from '../types/props/ResourceProps.js';
import type { Resource } from '../types/Resource.js';

import { getNextAutoKey, toInternalKey } from '../globals/autoKey.js';
import { createAtom } from '../primitives/createAtom.js';
import { createSelector } from '../primitives/createSelector.js';

export const createResource = <T extends Promise<unknown>>(
  props: ResourceProps<T>
): Resource<T> => {
  const key = props.key || getNextAutoKey();

  const RequestInvalidator = createAtom({
    key: toInternalKey(`${key}_invalidator`),
    default: 0,
  });

  const InnerSelector = createSelector<T>({
    key,
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
