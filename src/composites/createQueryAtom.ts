import type { QueryAtom } from '../types/QueryAtom';
import type { AtomProps } from '../types/AtomProps';
import type { Group } from '../types/Group';
import type { Atom } from '../types/Atom';

import { INTERNAL_KEY_PREFIX } from '../globals';
import { createAtom } from '../primitives/createAtom';
import { createGroup } from './createGroup';

let ValueGroup: Group<string, Atom<any>>;

export const createQueryAtom = <T = string | number>(
  props: Required<AtomProps<T>>
): QueryAtom<T> => {
  const key = props.key;

  if (!ValueGroup) {
    ValueGroup = createGroup({
      key: `${INTERNAL_KEY_PREFIX}_query_atoms`,
      getDefault: (id) =>
        createAtom({
          key: id,
          default: '',
        }),
    });
  }

  const Value: Atom<T> = ValueGroup.find(key);

  const currentQueryValue = new URLSearchParams(location.search).get(key);
  if (currentQueryValue && typeof props.default === 'number') {
    Value.set(parseFloat(currentQueryValue) as T);
  } else if (currentQueryValue && typeof props.default === 'string') {
    Value.set(currentQueryValue as T);
  } else {
    Value.set(props.default);
  }

  const toUrlString = (value: T) => {
    const query = new URLSearchParams(location.search);
    if (props.default === value) {
      query.delete(key);
    } else {
      query.set(key, String(value));
    }
    const queryString = query.toString();
    return `${location.origin}${location.pathname}${
      queryString.length > 0 ? `?${queryString}` : ''
    }`;
  };

  const api = {
    key,
    get: Value.get,
    subscribe: Value.subscribe,
    set: (valueOrFunction: T | ((oldValue: T) => T)) => {
      Value.set(valueOrFunction);
      history.pushState(null, '', toUrlString(Value.get()));
    },
    urlWhenSet: (valueOrFunction: T | ((oldValue: T) => T)) => {
      ValueGroup.get(); // Subscribe to all query atoms
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as (oldValue: T) => T;
        return toUrlString(func(Value.get()));
      }
      return toUrlString(valueOrFunction);
    },
  };

  return api;
};
