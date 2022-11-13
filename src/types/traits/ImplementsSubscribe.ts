export type ImplementsSubscribe = {
  subscribe: (id: string, notifyCallback: () => void) => () => void;
};
