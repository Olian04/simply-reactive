# simply-reactive

Simply-reactive is a [very small & dependency free](https://bundlephobia.com/package/simply-reactive) reactive state management library inspired by [Recoil](https://recoiljs.org/).

## Installation

__NPM:__

[`npm i simply-reactive`](https://www.npmjs.com/package/simply-reactive)

__CDN:__

```html
<script src="https://cdn.jsdelivr.net/npm/simply-reactive/cdn/simply-reactive.js"></script>
<script>
  const { createAtom, createSelector, createResource, createEffect } = simplyReactive;
</script>
```

## Usage

```ts
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

createEffect(({ get }) => {
  const c = get(C);
  console.log(c);
});

B.set(old => old * 2);
```

## Demos

* With [easy-render](https://github.com/Olian04/easy-render): <https://jsfiddle.net/btc25gnu/17/>
