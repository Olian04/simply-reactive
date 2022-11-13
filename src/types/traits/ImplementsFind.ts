export type ImplementsFind<T, I> = {
  find: (id: I) => T;
};
