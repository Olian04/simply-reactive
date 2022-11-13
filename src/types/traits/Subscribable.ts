export type Subscribable = {
  subscribe: (id: string, notifyCallback: () => void) => () => void;
};
