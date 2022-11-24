export type ReactiveContext = {
  registerDependency: (subscribe: (key: string) => void) => void;
};
