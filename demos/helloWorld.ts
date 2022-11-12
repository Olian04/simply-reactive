import { 
  createAtom,
  createEffect,
  createSelector,
} from '../src/api';

const A = createAtom({
  key: 'A',
  default: 2,
});

const B = createAtom({
  key: 'B',
  default: 3,
});

const C = createSelector({
  key: 'C',
  get: ({ get }) => {
    const a = get(A);
    const b = get(B);
    return a + b;
  }
});

const D = createSelector({
  key: 'D',
  get: ({ get }) => {
    const a = get(A);
    const c = get(C);
    return a + c;
  }
});

createEffect(({ get }) => {
  const a = get(A);
  const c = get(C);
  const d = get(D);
  console.log(`D: ${d} = ${a} + ${c}`);
});

createEffect(({ get }) => {
  const a = get(A);
  const b = get(B);
  const c = get(C);
  console.log(`C: ${c} = ${a} + ${b}`);
});

B.set(old => old * 2);

setTimeout(() => {
  A.set(3);
  B.set(3);
}, 10);


