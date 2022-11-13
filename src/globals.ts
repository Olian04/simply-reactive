import { ReactiveContext } from "./types/ReactiveContext";
import type { AtomMemory } from "./types/AtomMemory";
import type { EffectMemory } from "./types/EffectMemory";
import type { SelectorMemory } from "./types/SelectorMemory";
import { SubscribeFunction } from "./types/SubscribeFunction";

export const globalMemory: Record<
  string,
  AtomMemory | SelectorMemory | EffectMemory
> = {};

const rootContext: ReactiveContext = {
  registerDependency: () => {},
};
const contextStack: ReactiveContext[] = [rootContext];

export const registerDependency = (subscribe: SubscribeFunction) =>
  contextStack[contextStack.length - 1].registerDependency(subscribe);

export const pushReactiveContext = (context: ReactiveContext) =>
  contextStack.push(context);

export const popReactiveContext = () => contextStack.pop();

export const getNextAutoKey = (
  (nextAutoKey = 1) =>
  () =>
    `_${nextAutoKey++}`
)();
