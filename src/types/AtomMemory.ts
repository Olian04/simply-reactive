export type AtomMemory = {
  value: unknown;
  subscribers: {
    [key in string]: () => void;
  };
};
