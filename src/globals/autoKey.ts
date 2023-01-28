import { AUTO_KEY_PREFIX } from './constants';

export const getNextAutoKey = (
  (nextAutoKey = 1) =>
  () =>
    `${AUTO_KEY_PREFIX}_${nextAutoKey++}`
)();
