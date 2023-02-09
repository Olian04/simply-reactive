import { MaybePromise } from "../util/MaybePromise";

export namespace EffectProps {
  export type Callback = () => MaybePromise<(() => void) | void>;

  export type Config = {
    key: string;
    skipInit: boolean;
    debounceDuration: number;
  };
}
