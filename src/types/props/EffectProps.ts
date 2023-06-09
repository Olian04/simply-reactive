import { MaybePromise } from '../util/MaybePromise.js';

export namespace EffectProps {
  export type Callback = () => MaybePromise<(() => void) | void>;

  export type Config = {
    key: string;
    skipInit: boolean;
    debounceDuration: number;
  };
}
