import { getNextAutoKey } from '../globals';
import { createEffect } from '../primitives/createEffect';
import { Effect } from '../types/Effect';
import { EffectGroup } from '../types/EffectGroup';
import { EffectProps } from '../types/EffectProps';

export const createEffectGroup = (
  effectCallbacks: EffectProps.Callback[],
  config?: Partial<EffectProps.Config>
): EffectGroup => {
  const key = config?.key || getNextAutoKey();

  const effects: Effect[] = effectCallbacks.map((cb, index) =>
    createEffect(cb, {
      debounceDuration: config?.debounceDuration,
      key: `${key}_effect_${index}`,
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
