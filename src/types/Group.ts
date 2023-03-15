import type { ImplementsClear } from './traits/ImplementsClear';
import type { ImplementsFind } from './traits/ImplementsFind';
import type { ImplementsGet } from './traits/ImplementsGet';
import type { ImplementsKey } from './traits/ImplementsKey';
import type { ImplementsRemove } from './traits/ImplementsRemove';
import type { ImplementsSubscribe } from './traits/ImplementsSubscribe';

export type Group<Id, Value> = ImplementsKey &
  ImplementsGet<Id[]> &
  ImplementsFind<Id, Value> &
  ImplementsRemove<Id> &
  ImplementsClear &
  ImplementsSubscribe;
