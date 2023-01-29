type CleanupCallback = () => void;

export namespace EffectProps {
  export type Callback = () =>
    | CleanupCallback
    | void
    | Promise<CleanupCallback>
    | Promise<void>;

  export type Config = {
    key: string;
    skipInit: boolean;
    debounceDuration: number;
  };
}
