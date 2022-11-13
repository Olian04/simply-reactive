export type ReactiveContext = {
  registerDependency: (
    subscribe: (key: string, notifyCallback: () => void) => () => void
  ) => void;
};
