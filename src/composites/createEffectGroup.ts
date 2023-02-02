import type { EffectGroup } from '../types/EffectGroup';
import type { EffectProps } from '../types/EffectProps';

import { getNextAutoKey } from '../globals/autoKey';
import { createEffect } from '../primitives/createEffect';

export const createEffectGroup = (
  effectCallbacks: EffectProps.Callback[],
  config?: Partial<EffectProps.Config>
): EffectGroup => {
  const key = config?.key || getNextAutoKey();

  const effects = effectCallbacks.map((cb, index) =>
    createEffect(cb, {
      key: `${key}_${index}`,
      debounceDuration: config?.debounceDuration,
      skipInit: config?.skipInit,
    })
  );

  const api = {
    key,
    destroy: () => {
      effects.forEach((effect) => {
        effect.destroy();
      });
    },
    restore: () => {
      effects.forEach((effect) => {
        effect.restore();
      });
    },
  };
  return api;
};
