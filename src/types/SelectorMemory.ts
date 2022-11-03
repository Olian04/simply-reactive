export type SelectorMemory = {
  value: unknown;
  isDirty: boolean;
  subscribers: {
    [key in string]: () => void;
  };
  unsubscribeFunctions: (() => void)[];
};
