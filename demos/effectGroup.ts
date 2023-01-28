import { EventEmitter } from 'stream';
import {
  createAtom,
  createSelector,
  createEffectGroup,
  visualizeDependencyGraph,
} from '../dist/api';

const A = createAtom({
  key: 'a',
  default: 2,
});

const B = createAtom({
  key: 'b',
  default: 3,
});

const Prod = createSelector({
  key: 'Prod',
  get: () => A.get() * B.get(),
});

createEffectGroup([
  () => {
    console.log('A:', A.get());
  },
  () => {
    console.log('B:', B.get());
  },
  () => {
    console.log('Prod:', Prod.get());
  },
]);

console.log(visualizeDependencyGraph());

const eventEmitter = new EventEmitter();
eventEmitter.on('tick', () => {
  A.set((v) => v + 1);
});

setTimeout(() => eventEmitter.emit('tick'), 2000);
