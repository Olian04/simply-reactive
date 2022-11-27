import type { QueryAtom } from '../types/QueryAtom';

import { createAtom } from '../primitives/createAtom';
import { AtomProps } from '../types/AtomProps';

export const createQueryAtom = <T = string | number>(
  props: Required<AtomProps<T>>
): QueryAtom<T> => {
  const key = props.key;
  const Value = createAtom({
    key,
    default: props.default,
  });

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
      if (typeof valueOrFunction === 'function') {
        const func = valueOrFunction as (oldValue: T) => T;
        return toQueryString(func(Value.get()));
      }
      return toQueryString(valueOrFunction);
    },
  };

  return api;
};
