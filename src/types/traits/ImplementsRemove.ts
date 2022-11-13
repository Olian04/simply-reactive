export type ImplementsRemove<A> = {
  remove: (...args: A[]) => void;
};
