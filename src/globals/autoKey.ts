import { AUTO_KEY_PREFIX, INTERNAL_KEY_PREFIX } from './constants.js';

let nextAutoKey = 1;

export const getNextAutoKey = (): `${typeof AUTO_KEY_PREFIX}_${number}` =>
  `${AUTO_KEY_PREFIX}_${nextAutoKey++}`;

export const toInternalKey = <T extends string>(key: T): `${typeof INTERNAL_KEY_PREFIX}_${T}` =>
  `${INTERNAL_KEY_PREFIX}_${key}`;
