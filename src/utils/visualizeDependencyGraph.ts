import {
  AUTO_KEY_PREFIX,
  getAllLivingMemory,
  INTERNAL_KEY_PREFIX,
} from '../globals';
import { AtomMemory } from '../types/AtomMemory';
import { SelectorMemory } from '../types/SelectorMemory';

type IncludeCategory = 'auto-keyed' | 'name-keyed' | 'internal';

/**
 * Returns a string representation of the dependencies between each reactive primitive as they are at the point of invocation.
 * The return string is formatted as a mermaid flowchart.
 * @see [Mermaid](https://mermaid-js.github.io)
 *
 * @param {IncludeCategory[]} include
 */
export const visualizeDependencyGraph = (
  include: IncludeCategory[] = ['auto-keyed', 'name-keyed']
) => {
  const includeMap = include.reduce((acc, v) => {
    acc[v] = true;
    return acc;
  }, {} as Partial<{ [k in IncludeCategory]: boolean }>);

  const shouldInclude = (key: string) => {
    if (key.startsWith(INTERNAL_KEY_PREFIX)) {
      return includeMap['internal'];
    }
    if (key.startsWith(AUTO_KEY_PREFIX)) {
      return includeMap['auto-keyed'];
    }
    return includeMap['name-keyed'];
  };

  let nextIndex = 0;
  const indexMap = new Map<string, number>();

  const mermaidGraph = ['flowchart TD;'];
  for (let mem of getAllLivingMemory<AtomMemory | SelectorMemory>()) {
    if (!indexMap.has(mem.key)) {
      indexMap.set(mem.key, nextIndex++);
    }
    if (!shouldInclude(mem.key)) continue;
    if ('subscribers' in mem) {
      for (let subKey of mem.subscribers.values()) {
        if (!indexMap.has(subKey)) {
          indexMap.set(subKey, nextIndex++);
        }
        if (!shouldInclude(subKey)) continue;
        mermaidGraph.push(
          `${indexMap.get(mem.key)}("${mem.key}")-->${indexMap.get(
            subKey
          )}("${subKey}");`
        );
      }
    }
  }
  return mermaidGraph.join('\n\t');
};
