[![Latest released version](https://img.shields.io/npm/v/simply-reactive)](https://www.npmjs.com/package/simply-reactive)
[![Minified and gzipped bundle size](https://img.shields.io/bundlephobia/minzip/simply-reactive)](https://bundlephobia.com/package/simply-reactive)
![Type support](https://img.shields.io/npm/types/simply-reactive)
[![Downloads from NPM](https://img.shields.io/npm/dm/simply-reactive?label=downloads%20npm)](https://www.npmjs.com/package/simply-reactive)
[![Downloads from JSDeliver](https://img.shields.io/jsdelivr/npm/hm/simply-reactive?label=downloads%20jsDelivr)](https://www.jsdelivr.com/package/npm/simply-reactive)
[![Build status of main branch](https://img.shields.io/circleci/build/github/Olian04/simply-reactive/main?label=test%20%26%20build)](https://app.circleci.com/pipelines/github/Olian04/simply-reactive)
[![Code percentage covered by tests on main branch](https://codecov.io/gh/Olian04/simply-reactive/branch/main/graph/badge.svg?token=mcsHmshPaF)](https://codecov.io/gh/Olian04/simply-reactive)
[![MIT licensed](https://img.shields.io/npm/l/simply-reactive)](./LICENSE)

# simply-reactive

Simply-reactive is a [small & dependency free](https://bundlephobia.com/package/simply-reactive) reactive state management library inspired by [Solidjs](https://github.com/solidjs/solid) and [Recoiljs](https://github.com/facebookexperimental/Recoil).

## Installation

### NPM

[`npm i simply-reactive`](https://www.npmjs.com/package/simply-reactive)

```ts
import { createAtom, createEffect, createSelector } from 'simply-reactive';
```

### CDN

#### ESM

```html
<script type="module">
  import {
    createAtom,
    createEffect,
    createSelector,
  } from 'https://cdn.jsdelivr.net/npm/simply-reactive';
</script>
```

#### UMD

```html
<script src="https://cdn.jsdelivr.net/npm/simply-reactive/cdn/umd.js"></script>
<script>
  const { createAtom, createEffect, createSelector } = simplyReactive;
</script>
```

## Demos

- Counting with Atoms & Selectors: [demos/count.ts](./demos/count.ts)
- Counting with Groups: [demos/groups.ts](./demos/groups.ts)
- Interactive web page: [demos/web.html](./demos/web.html)
- Simple web app: https://jsfiddle.net/06xo19v2/39
- Simple web app with [easy-render](https://github.com/Olian04/easy-render): <https://jsfiddle.net/20crm4ah/>
- Simple web app with [brynja](https://github.com/Olian04/brynja): <https://jsfiddle.net/rb4xc25f/47/>

## Documentation

`Simply-reactive` provides three reactive primitives:

- [Atoms](#atom) are single pieces of reactive state.
- [Selectors](#selector) are pieces of derived reactive state.
- [Effects](#effect) are side effects produced by changes to the reactive graph.

`Simply-reactive` also provides four reactive composites:

- [Groups](#group) are atoms containing collections of reactive primitives or other reactive composites.
- [Effect Groups](#effect-group) are collections of effects used for enabeling and disabeling multiple effects at once.
- [Resources](#resource) are selectors specifically optimized for data fetching.
- [External Selectors](#external-selector) are selectors specifiacally optimized for interfacing with other reactive systems.

### Atom

Atoms are single pieces of reactive state.

```ts
const Count = createAtom({
  default: 0,
});
Count.set(1);
console.log(`Count: ${Count.get()}`);
```

### Selector

Selectors are pieces of derived reactive state.

```ts
const DoubleCount = createSelector({
  get: () => {
    return Count.get() * 2;
  },
});
console.log(`Count: ${DoubleCount.get()}`);
```

### Effect

Effects are side effects produced by changes to the reactive graph.

```ts
createEffect(() => {
  console.log(`${DoubleCount.get()} is twice as big as ${Count.get()}`);
});

setInterval(() => {
  Count.set((c) => c + 1);
}, 1000);
```

### Group

Groups are atoms containing collections of reactive primitives or other reactive composites.

```ts
const CountGroup = createGroup({
  getDefault: () =>
    createAtom({
      default: 0,
    }),
});

const DoubleCountGroup = createGroup({
  getDefault: (index) =>
    createSelector({
      get: () => CountGroup.find(index).get() * 2,
    }),
});

CountGroup.find(0).set(5);
CountGroup.find(1).set(2);
console.log(DoubleCountGroup.find(0).get()); // 10
console.log(DoubleCountGroup.find(1).get()); // 4
console.log(DoubleCountGroup.find(2).get()); // 0
```

### Effect Group

Effect Groups are collections of effects used for enabeling and disabeling multiple effects at once.

```ts
createEffectGroup([
  () => (document.getElementById('in-a').value = A.get()),
  () => (document.getElementById('in-b').value = B.get()),
  () => (document.getElementById('out-a').innerText = A.get()),
  () => (document.getElementById('out-b').innerText = B.get()),
  () => (document.getElementById('out-product').innerText = A.get() * B.get()),
]);

document.getElementById('in-a').addEventListener('change', (ev) => {
  A.set(parseInt(ev.target.value, 10));
});
document.getElementById('in-b').addEventListener('change', (ev) => {
  B.set(parseInt(ev.target.value, 10));
});
```

### Resource

Resources are selectors specifically optimized for data fetching.

```ts
const Data = createResource({
  get: async () => fetch(...),
});

console.log(`Data after first load ${await Data.get()}`);

Data.invalidate();
console.log(`Data after second load ${await Data.get()}`);
```

### External Selector

External Selectors are selectors specifiacally optimized for interfacing with other reactive systems.

```ts
const Name = createExternalSelector({
  default: '',
  setup: (set) => {
    document
      .querySelector('#input')
      .addEventListener('change', (ev) => set(ev.target.value));
  },
});

createEffect(() => {
  document.querySelector('#output').innerText = `Hello, ${
    Name.get() ?? 'World'
  }!`;
});
```
