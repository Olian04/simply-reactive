import { ImplementsClear } from './traits/ImplementsClear';
import { ImplementsFind } from './traits/ImplementsFind';
import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import { ImplementsRemove } from './traits/ImplementsRemove';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';

export type Group<Id, Value> = ImplementsKey &
  ImplementsGet<Value[]> &
  ImplementsFind<Value, Id> &
  ImplementsRemove<Id> &
  ImplementsClear &
  ImplementsSubscribe;
