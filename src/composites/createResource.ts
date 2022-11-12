import { createAtom } from "../primitives/createAtom";
import { createSelector } from "../primitives/createSelector";

export const createResource = <T extends Promise<unknown>,>(props: {
  key?: string,
  get: () => T
}) => {
  const RequestInvalidator = createAtom({
    default: 0,
  });
  
  const InnerSelector = createSelector<T>({
    key: props.key,
    get: () => {
      RequestInvalidator.get();
      return props.get();
    },
  });

  return {
    key: InnerSelector.key,
    get: () => InnerSelector.get(),
    invalidate: () => RequestInvalidator.set(v => v + 1),
  }
}
