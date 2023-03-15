import type { ExternalSelectorProps } from '../types/props/ExternalSelectorProps';
import type { ExternalSelector } from '../types/ExternalSelector';

import { getNextAutoKey, toInternalKey } from '../globals/autoKey';
import { createAtom } from '../primitives/createAtom';
import { createEffect } from '../primitives/createEffect';

export const createExternalSelector = <T>(
  props: ExternalSelectorProps<T>
): ExternalSelector<T> => {
  const key = props.key || getNextAutoKey();

  const Atom = createAtom({
    key,
    default: props.default,
  });
  const Effect = createEffect(() => props.setup((v) => Atom.set(() => v)), {
    key: toInternalKey(`${key}_setup`),
  });

  return {
    key,
    get: Atom.get,
    subscribe: Atom.subscribe,
    destroy: Effect.destroy,
    restore: Effect.restore,
  };
};
