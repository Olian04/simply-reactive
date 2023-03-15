export type ExternalSelectorProps<T> = {
  key?: string;
  default: T;
  setup: (set: (value: T) => void) => (() => void) | void;
};
