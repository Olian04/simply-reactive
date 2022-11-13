import { SubscribeFunction } from "./SubscribeFunction";

export type Selector<T> = {
  key: string;
  get: () => T;
  subscribe: SubscribeFunction;
};
