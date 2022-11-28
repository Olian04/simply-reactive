[![](https://img.shields.io/npm/v/simply-reactive)](https://www.npmjs.com/package/simply-reactive)
![](https://img.shields.io/npm/types/simply-reactive)
[![](https://img.shields.io/npm/dm/simply-reactive?label=downloads%20npm)](https://www.npmjs.com/package/simply-reactive)
[![](https://img.shields.io/jsdelivr/npm/hm/simply-reactive?label=downloads%20jsDelivr)](https://www.jsdelivr.com/package/npm/simply-reactive)
[![](https://img.shields.io/circleci/build/github/Olian04/simply-reactive/main?label=test%20%26%20build)](https://app.circleci.com/pipelines/github/Olian04/simply-reactive)
[![](https://img.shields.io/npm/l/simply-reactive)](./LICENSE)

# simply-reactive

Simply-reactive is a [small & dependency free](https://bundlephobia.com/package/simply-reactive) reactive state management library inspired by [Solidjs](https://github.com/solidjs/solid) and [Recoiljs](https://github.com/facebookexperimental/Recoil).

## Installation

**NPM:**

[`npm i simply-reactive`](https://www.npmjs.com/package/simply-reactive)

**CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/simply-reactive"></script>
<script>
  const { createAtom, createSelector, createEffect } = simplyReactive;
</script>
```

## Demos

- Counting with Atoms & Selectors: [demos/count.ts](./demos/count.ts)
- Counting with Groups: [demos/groups.ts](./demos/groups.ts)
- With [easy-render](https://github.com/Olian04/easy-render): <https://jsfiddle.net/jhtfxo91/2/>

## Documentation

`Simply-reactive` provides three reactive primitives:

- [Atoms](#atom) are single pieces of reactive state.
- [Selectors](#selector) are pieces of derived reactive state.
- [Effects](#effect) are side effects produced by changes to the reactive graph.

`Simply-reactive` also provides four reactive composites:

- [Groups](#group) are atoms containing collections of reactive primitives or other reactive composites.
- [Effect Groups](#effect-Group) are collections of effects used for enabeling and disabeling multiple effects at once.
- [Resources](#resource) are selectors specifically optimized for data fetching.
- [Query Atoms](#query-atom) are atoms with two way databindings to query search parameters.

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
const LogEffect = createEffect(() => {
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
const EffectGroup = createEffectGroup([
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

### Query Atom

Query Atoms are atoms with two way databindings to query search parameters.

```ts
const A = createQueryAtom({
  key: 'a',
  default: 0,
});

A.set(3);

// Reload page

A.get(); // 3
```
