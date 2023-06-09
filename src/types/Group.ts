import type { ImplementsClear } from './traits/ImplementsClear.js';
import type { ImplementsFind } from './traits/ImplementsFind.js';
import type { ImplementsGet } from './traits/ImplementsGet.js';
import type { ImplementsKey } from './traits/ImplementsKey.js';
import type { ImplementsRemove } from './traits/ImplementsRemove.js';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe.js';

export type Group<Value> = ImplementsKey &
  ImplementsGet<string[]> &
  ImplementsFind<string | number, Value> &
  ImplementsRemove<string | number> &
  ImplementsClear &
  ImplementsSubscribe;
