export type Serializeable =
  | undefined
  | null
  | string
  | number
  | Serializeable[]
  | { [K in string | number]: Serializeable };
