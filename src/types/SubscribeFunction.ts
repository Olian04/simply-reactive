export type SubscribeFunction = (
  id: string,
  notifyCallback: () => void
) => () => void;