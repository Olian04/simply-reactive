import { globalMemory } from '../globals';

/**
 * Returns a string representation of the dependencies between each reactive primitive as they are at the point of invocation.
 * The return string is formatted as a mermaid flowchart.
 * @see [Mermaid](https://mermaid-js.github.io)
 */
export const visualizeDependencyGraph = () => {
  const mermaidGraph = ['graph TD;'];
  for (let [key, mem] of Object.entries(globalMemory)) {
    if ('subscribers' in mem) {
      for (let subKey of Object.keys(mem.subscribers)) {
        mermaidGraph.push(`${key}-->${subKey};`);
      }
    }
  }
  return mermaidGraph.join('\n\t');
};
