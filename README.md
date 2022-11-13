[![](https://img.shields.io/npm/v/simply-reactive)](https://www.npmjs.com/package/simply-reactive)
![](https://img.shields.io/npm/types/simply-reactive)
[![](https://img.shields.io/npm/dm/simply-reactive?label=downloads%20npm)](https://www.npmjs.com/package/simply-reactive)
[![](https://img.shields.io/jsdelivr/npm/hm/simply-reactive?label=downloads%20jsDelivr)](https://www.jsdelivr.com/package/npm/simply-reactive)
[![](https://img.shields.io/circleci/build/github/Olian04/simply-reactive/main?label=test%20%26%20build)](https://app.circleci.com/pipelines/github/Olian04/simply-reactive)
[![](https://img.shields.io/npm/l/simply-reactive)](/LICENSE)

# simply-reactive

Simply-reactive is a [very small & dependency free](https://bundlephobia.com/package/simply-reactive) reactive state management library inspired by [Solidjs](https://www.solidjs.com/) and [Recoiljs](https://recoiljs.org/).

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

- With [easy-render](https://github.com/Olian04/easy-render): <https://jsfiddle.net/mx1h2ctd/13/>

## Documentation

`Simply-reactive` provides three reactive primitives:

- [Atoms](#atom) are single pieces of reactive state.
- [Selectors](#selector) are pieces of derived reactive state.
- [Effects](#effect) are side effects produced by changes to the reactive graph.

`Simply-reactive` also provides two reactive composites:

- [Groups](#group) are atoms containing collections of reactive primitives or other reactive composites.
- [Resources](#resource) are selectors specifically optimized for data fetching.

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
// WIP
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
