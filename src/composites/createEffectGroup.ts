import type { EffectGroup } from '../types/EffectGroup.js';
import type { EffectProps } from '../types/props/EffectProps.js';

import { getNextAutoKey } from '../globals/autoKey.js';
import { createEffect } from '../primitives/createEffect.js';

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
