import { subscribeTo } from './subscribe.utils';

const contextStack: string[] = [];
export const pushReactiveContext = (key: string) => contextStack.push(key);
export const popReactiveContext = () => contextStack.pop();
export const registerDependency = (key: string) =>
  subscribeTo(key, contextStack[contextStack.length - 1]);
