import { getAllLivingMemory } from '../globals';
import { AtomMemory } from '../types/AtomMemory';
import { SelectorMemory } from '../types/SelectorMemory';

/**
 * Returns a string representation of the dependencies between each reactive primitive as they are at the point of invocation.
 * The return string is formatted as a mermaid flowchart.
 * @see [Mermaid](https://mermaid-js.github.io)
 */
export const visualizeDependencyGraph = () => {
  const mermaidGraph = ['graph TD;'];
  for (let mem of getAllLivingMemory<AtomMemory | SelectorMemory>()) {
    if ('subscribers' in mem) {
      for (let subKey of Object.keys(mem.subscribers)) {
        mermaidGraph.push(`${mem.key}-->${subKey};`);
      }
    }
  }
  return mermaidGraph.join('\n\t');
};
