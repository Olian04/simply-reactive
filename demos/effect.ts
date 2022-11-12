import { 
  createAtom,
  createEffect,
} from '../src/api';

const A = createAtom({
  key: 'A',
  default: 0,
});

const destroyFirst = createEffect(({ get }) => {
  const a = get(A);
  console.log(`First: ${a}`);
});

const destroySecond = createEffect(({ get }) => {
  const a = get(A);
  console.log(`Second: ${a}`);
});

A.set(1);

setTimeout(() => {
  A.set(2);
  destroyFirst();
  setTimeout(() => {
    A.set(3);
    destroySecond();
    setTimeout(() => {
      A.set(4);
    }, 10);
  }, 10);
}, 10);


