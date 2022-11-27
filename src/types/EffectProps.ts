export namespace EffectProps {
  export type Callback = () => void | Promise<void>;
  export type Config = {
    key: string;
    skipInit: boolean;
    debounceDuration: number;
  };
}
