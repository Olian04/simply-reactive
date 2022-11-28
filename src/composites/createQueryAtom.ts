import type { QueryAtom } from '../types/QueryAtom';
import type { AtomProps } from '../types/AtomProps';

import { createAtom } from '../primitives/createAtom';
import { Atom, createGroup, Group } from '../api.core';
import { getNextAutoKey } from '../globals';

let ValueGroup: Group<string, Atom<any>>;

export const createQueryAtom = <T = string | number>(
  props: Required<AtomProps<T>>
): QueryAtom<T> => {
  const key = props.key;

  if (!ValueGroup) {
    ValueGroup = createGroup({
      key: `${getNextAutoKey()}_query_atom_group`,
      getDefault: (id) =>
        createAtom({
          key: id,
          default: '',
        }),
    });
  }

  const Value: Atom<T> = ValueGroup.find(key);
  Value.set(props.default);

  const currentQueryValue = new URLSearchParams(location.search).get(key);
  if (currentQueryValue) {
    if (typeof props.default === 'number') {
      Value.set(parseFloat(currentQueryValue) as T);
    }
    if (typeof props.default === 'string') {
      Value.set(currentQueryValue as T);
    }
  }

  const toQueryString = (value: T) => {
    const query = new URLSearchParams(location.search);
    if (props.default === value) {
      query.delete(key);
    } else {
      query.set(key, String(value));
    }
    return `${location.origin}${location.pathname}?${query.toString()}`;
  };

  const api = {
    key,
    get: Value.get,
    subscribe: Value.subscribe,
    set: (valueOrFunction: T | ((oldValue: T) => T)) => {
      Value.set(valueOrFunction);
      history.pushState(null, '', toQueryString(Value.get()));
    },
    urlWhenSet: (valueOrFunction: T | ((oldValue: T) => T)) => {
      ValueGroup.get(); // Subscribe to all query atoms
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as (oldValue: T) => T;
        return toQueryString(func(Value.get()));
      }
      return toQueryString(valueOrFunction);
    },
  };

  return api;
};
