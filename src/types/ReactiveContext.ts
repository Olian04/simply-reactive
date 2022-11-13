export type ReactiveContext = {
  registerDependency: (subscribe: SubscribeFunction) => void;
};

export type SubscribeFunction = (
  key: string,
  notifyCallback: () => void
) => () => void;
