import type { ImplementsKey } from "../types/traits/ImplementsKey";
import type { ImplementsGet } from "../types/traits/ImplementsGet";
import type { ImplementsSet } from "../types/traits/ImplementsSet";
import type { ImplementsSubscribe } from "../types/traits/ImplementsSubscribe";

import { getMemory } from '../globals/memory';
import { createEffect } from "../primitives/createEffect";

export const createBackFlow = <T>(props: {
  key?: string,
  from: ImplementsKey & ImplementsSubscribe & ImplementsGet<T>,
  to: ImplementsKey & ImplementsSet<T>,
}) => createEffect(() => {
  const v = props.from.get();

  const visitedKeys: { [k in string]: Boolean } = {};
  const keyQueue = [props.from.key];
  while (keyQueue.length > 0) {
    const mem = getMemory(keyQueue.shift() as string) as any as { key: string; subscribers: Set<string>; }
    if (mem.key === props.to.key) {
      throw new Error(`Simply-reactive: Failed to construct back flow from ${props.from.key} to ${props.to.key} because it would result in a circular dependency.`);
    }
    visitedKeys[mem.key] = true;
    for (let subKey of mem.subscribers.values()) {
      if (visitedKeys[subKey]) continue;
      keyQueue.push(subKey);
    }
  }

  props.to.set(v);
}, { key: props.key });
