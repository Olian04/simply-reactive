import type { Serializeable } from '../types/util/Serializeable.js';

const algorithms = {
  dbj2: (text: string) => {
    let hash = 5381;
    let index = text.length;

    while (index) {
      hash = (hash * 33) ^ text.charCodeAt(--index);
    }

    return hash >>> 0;
  },
  sdbm: (text: string) => {
    let hash = 0;
    let index = text.length;

    while (index) {
      hash = text.charCodeAt(--index) + (hash << 6) + (hash << 16) - hash;
    }

    return hash;
  },
};

export const calculateHash = (
  obj: Serializeable,
  algorithm: keyof typeof algorithms = 'dbj2'
) => String(algorithms[algorithm](JSON.stringify(obj)));
