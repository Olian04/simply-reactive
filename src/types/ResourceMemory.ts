export type ResourceMemory = {
  value: unknown;
  isDirty: boolean;
  subscribers: {
    [key in string]: () => void;
  };
  unsubscribeFunctions: (() => void)[];
};
