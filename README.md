# simply-reactive

```ts
const A = createAtom({
  key: 'A',
  default: 'a',
});

const B = createAtom({
  key: 'B',
  default: 1,
});

const C = createSelector({
  key: 'C',
  get: ({ get }) => {
   const a = get(A);
   const b = get(B);
   return `${a}-${b}`;
  }
});

const D = createSelector({
  key: 'D',
  get: ({ get }) => {
   const a = get(A);
   const c = get(C);
   return `${a}_${c}`;
  }
});

const R = createResource({
  key: 'R',
  get: async ({ get }) => {
   const c = get(C);
   return `R: ${c}`;
  }
});

const T = createResource({
  key: 'T',
  get: async ({ get }) => {
   const r = await get(R);
   return `T: ${r}`;
  }
});

createEffect(({ get }) => {
  const d = get(D);
  console.log(d); // a_a-1
});

createEffect(async ({ get }) => {
  const t = await get(T);
  const r = await get(R);
  console.log(t); // T: R: a-1
  console.log(r); // R: a-1
});
```


## POC

```ts
const globalMemory: Record<string, AtomMemory | SelectorMemory | ResourceMemory | EffectMemory> = {};

type Atom<T> = {
   key: string;
   get: () => T;
   set: (valueOrFunction: T | ((old: T) => T)) => void;
   subscribe: (id: string, notifyCallback: () => void) => () => void;
}

type Selector<T> = {
   key: string;
   get: () => T;
   subscribe: (id: string, notifyCallback: () => void) => () => void;
}

type Resource<T> = {
   key: string;
   get: () => Promise<T>;
   subscribe: (id: string, notifyCallback: () => void) => () => void;
}

type Getter = {
   <T,>(gettable: Resource<T>): Promise<T>;
   <T,>(gettable: Atom<T>): T;
   <T,>(gettable: Selector<T>): T;
}

type SyncronousGetter = {
   <T,>(gettable: Atom<T>): T;
   <T,>(gettable: Selector<T>): T;
}

type Gettable<T> =
 | Atom<T>
 | Selector<T>;
 
type AsyncGettable<T> =
 | Atom<T>
 | Selector<T>
 | Resource<T>;

type AtomMemory = {
   value: unknown;
   subscribers: {
      [key in string]: () => void;
   }
}

type SelectorMemory = {
   value: unknown;
   isDirty: boolean;
   subscribers: {
      [key in string]: () => void;
   };
   unsubscribeFunctions: (() => void)[];
}

type ResourceMemory = {
   value: unknown;
   isDirty: boolean;
   subscribers: {
      [key in string]: () => void;
   };
   unsubscribeFunctions: (() => void)[];
}

type EffectMemory = {
   notifyTimeoutId: number | undefined;
   debounceDuration: number;
   unsubscribeFunctions: (() => void)[];
}

type AtomProps<T> = {
   key: string;
   default: T;
}

type SelectorProps<T> = {
   key: string;
   get: (ctx: { 
      get: SyncronousGetter; 
   }) => T; 
}

type ResourceProps<T> = {
   key: string;
   get: (ctx: { 
      get: Getter 
   }) => Promise<T>; 
}

/**
 * Returns an atomic piece of reactive state.
 */
const createAtom = ((mem: Record<string, AtomMemory>) => <T,>(props: AtomProps<T>): Atom<T> => {
	if (! (props.key in mem)) {
    mem[props.key] = {
    	value: props.default,
      subscribers: {},
    };
  }
  const api = {
  	key: props.key,
  	set: (valueOrFunction: T | ((oldValue: T) => T)) => {
    	if (typeof valueOrFunction === 'function') {
         const func = valueOrFunction as ((oldValue: T) => T);
      	mem[props.key].value = func(mem[props.key].value as T);
      } else {
      	mem[props.key].value = valueOrFunction;
      }
      Object.values(mem[props.key].subscribers)
      	.forEach(notifyCallback => notifyCallback());
    },
    get: () => mem[props.key].value as T,
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[props.key].subscribers[id] = notifyCallback
      return () => {
        delete mem[props.key].subscribers[id];
      }
    },
  };
  return api;
})(globalMemory as any);

/**
 * Returns a lazy evaluated synchronous selector that only re-evaluates when the values of its dependencies change. 
 */
const createSelector = ((mem: Record<string, SelectorMemory>) => <T,>(props: SelectorProps<T>): Selector<T> => {
	const onDependencyChanged = () => {
    mem[props.key].isDirty = true;
    Object.values(mem[props.key].subscribers)
      .forEach(notifyCallback => notifyCallback());
  };
	const getDependency = <R,>(gettable: Gettable<R>) => {
    const unsubscribe = gettable.subscribe(props.key, onDependencyChanged);
    mem[props.key].unsubscribeFunctions.push(unsubscribe);
    return gettable.get();
  };
	if (!(props.key in mem)) {
    mem[props.key] = {
    	value: null,
      isDirty: true,
      subscribers: {},
      unsubscribeFunctions: [],
    };
  }
  const api = {
  	key: props.key,
    get: () => {        
      if (mem[props.key].isDirty) {
        mem[props.key].unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        mem[props.key].unsubscribeFunctions = [];
      	mem[props.key].value = props.get({
          get: getDependency,
        });
        mem[props.key].isDirty = false;
      }
      return mem[props.key].value as T;
    },
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[props.key].subscribers[id] = notifyCallback
      return () => {
        delete mem[props.key].subscribers[id];
      }
    },
  };
  return api;
})(globalMemory as any);

/**
 * Returns a lazy evaluated asynchronous recource that only re-evaluates when the values of its dependencies change. 
 */
const createResource = ((mem: Record<string, ResourceMemory>) => <T,>(props: ResourceProps<T>): Resource<T> => {
	const onDependencyChanged = () => {
    mem[props.key].isDirty = true;
    Object.values(mem[props.key].subscribers)
      .forEach(notifyCallback => notifyCallback());
  };
	const getDependency = <R,>(gettable: AsyncGettable<R>) => {
    const unsubscribe = gettable.subscribe(props.key, onDependencyChanged);
    mem[props.key].unsubscribeFunctions.push(unsubscribe);
    return gettable.get();
  };
	if (!(props.key in mem)) {
    mem[props.key] = {
    	value: null,
      isDirty: true,
      subscribers: {},
      unsubscribeFunctions: [],
    };
  }
  const api = {
  	key: props.key,
    get: async () => {
      if (mem[props.key].isDirty) {
        mem[props.key].unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        mem[props.key].unsubscribeFunctions = [];
      	mem[props.key].value = await props.get({
          get: getDependency,
        });
        mem[props.key].isDirty = false;
      }
      return mem[props.key].value as T;
    },
    subscribe: (id: string, notifyCallback: () => void) => {
      mem[props.key].subscribers[id] = notifyCallback
      return () => {
        delete mem[props.key].subscribers[id];
      }
    },
  };
  return api;
})(globalMemory as any);

/**
 * Creates an eagarly evaluated synchronous or asynchronous effect that re-runs whenever the values of its dependencies change.
 * Changes to dependencies will enqueu the effect to run once the debounce duration has passed and the event queue is empty.
 * Further changes made before the effect runs will debounce the effect again.
 * 
 * @param {number} debounceDuration The minimum number of milliseconds to wait before running the effect once a change has been detected. Setting the debounceDuration to `-1` will disable the debounce behavior entirely.
 */
const createEffect = ((mem: Record<string, EffectMemory>, nextAutoKey = 1) => (notifyCallback: (ctx: { get: Getter }) => void, config?: Partial<{ debounceDuration: number, key: string }>) => {
  const key = String(config?.key || nextAutoKey++);
  if (!(key in mem)) {
    mem[key] = {
      notifyTimeoutId: undefined,
      debounceDuration: config?.debounceDuration ?? 0,
      unsubscribeFunctions: [],
    };
  }
  const getDependency = <T,>(gettable: AsyncGettable<T>) => {
  	gettable.subscribe(key, () => {
      if (mem[key].debounceDuration === -1) {
        // Disable debounce. Will run notifyCallback once for each change made to any of its dependencies. Not reccomended.
        runNofity();
        return;
      }
  		clearTimeout(mem[key].notifyTimeoutId);
    	mem[key].notifyTimeoutId = setTimeout(runNofity, mem[key].debounceDuration);
    });
    return gettable.get();
  };
  const runNofity = () => {
   notifyCallback({
     get: getDependency,
   });
  }
  runNofity();
})(globalMemory as any);

/**
 * Returns a string representation of the dependencies between each reactive primitive created at the point of invocation.
 * The return string is formatted as a mermaid flowchart.
 * @see [Mermaid](https://mermaid-js.github.io/mermaid)
 */
const visualizeDependencies = () => {
  const mermaidGraph = [
    'graph TD;'
  ];
  for (let [key, mem] of Object.entries(globalMemory)) {
    if ('subscribers' in mem) {
      for (let subKey of Object.keys(mem.subscribers)) {
        mermaidGraph.push(`${key}-->${subKey};`);
      }
    }
  }
  return mermaidGraph.join('\n\t');
}
```

[Playground](https://www.typescriptlang.org/play?ts=4.8.0-beta#code/MYewdgzgLgBA5gGxAIwIYILIFMC2IBOAngFwwBKWo+AJgDzT4CWYcANDAIJQg7Z5EwAPjADKWBJW74+BQkPJYIIAK75gWGQOEBRAGa7JmwgD4YAXhgBvAL4BuALAAoJ1EIAHLJ245aAFVMWlk4wIQDWWCQwDMxwDo4h8FhQpAAUAJTmpr5xCRBJqQBu6MpYAPL4AGLKYMBQjOCkvvIpKSAI1I0ZZllpXaYFIIzUOSEQysgQwEzIWKlDpNEs7GAgdbqEAMLoCGjAoal9MANDh+mZR4PDTtZOLu6eYhK1BH4BVsFhEQtQTCwjickYGdujBsh8ouNJtNZkD5lEfjFlqtGOstggdqg9gdzsdqKdDri4jdnI5XB4FEpVOpXuZ3vFPpFFrFwXB8kDDgAFfA8Rh5V7-MYTKaMGZzDrw35sGArNabba7fbsnGXfHKoZE26k+4wADiSSgWHwtKC9JgflYxhSrKgUFQyAkpAolLUWFeaVIXJ5fP8-3NluttvtMK4PDdjV9vgtVv1dodonEkhe-ndoI1JLJD0INW5K2UED1NsNxvBfujNtjwe8YdTJcj-pjQdIj0T+GrYMcxLu5ILgYkNLMwWEIZ8-kH8aeUn5wS7ng4ECzwB7Ff7Y+HrzHzeerdH8WETpULqn6e1w6MxdNRQQJVI1VCKwA7mABZDhTN8BBSCaEgkANrhOTMBKMQALrYiChLgsSnZauSm5SGegTgpe14wLeD5PuCvIACKMPgrikMgIBtFgqAYaagpQiKhofnS34hH+EQwIBTKgUq4GXP8djgtUFGvlgVQ1HU4A0S0BIqj+wFpjOFIHuoCG0SEyEwmhICPv82G4fhMCEcRpHPkK0Lvp+4K-v+TFgEBLCscC-QcZB-w8S+0ICbU9SQKkNkXCcElSTBnh6AYtTyV+IQyiihC+IwOBYCoUAAJLimAyg4G+8jVNQWC6MwWBXKaGWEdU6hYaoqBCWApBJSlhoOZATlUS5ZUiZ5uJpD51yahmXg8J6bgQP2CkwP+3ySv8GW6KgygIIC7bQZ1cEED1fX+OeCRDZZzKmtaqS1AAHp+MAmSEW2iAuOYqPm+rVQdprWIc2TXbN2r7lSWCLf1IWDV863-MdKS7fth0AqQPZFpBnLcjgvKuj6D2agA9AAVAjwQIwoUCqJAMCkVj3iMMAMBuIwlCeCAugwPgJGuQUnjQKVWAAHQo3DTigJAsBTCRBrDrSLTRTgjqUAQdBMuwp64LIxiHKWbjcr1pDDm9yby1Wy0giaACQKJAgAhECMsgL19NmYBfO9ANMB8z++uG-+wErQk6tKaQ1sQPTY0TVNrCA7xhk0TYXumjAXH0sSISs9AWOE-b6trS7RsRAHITq3kgIpEp5QNW5jTNK07QAGrFDCvh3WbasmZrZMpBmpNHIXGeFWV5hmBYADkugN25LcZB9dEwOHsDtzUtLp5UHfgFjEBArn1AF1eRcl-8DuW3Htv00ptKD8AKTL7Lrur+vqCT8Xi8hNYMDiHk5tJzvBt7xEwFr4Xw916PgluSfQeA6UyAAFaSI-c8IDb1wFbXe8dCAPx9lRd8aRAbq3proAg2hMQAAsUhhVRPKTEoRzgYLlOiBU6Q0iL2sInBIv1Dg3xtvfABJQJ6gjIaMOqopYTihFtKZEmCCHYLArZE45we4hCoXfCB9MoFvggD+IYdsLB4LRBiPYgMKbo3wBZTygiEgZQkAaC2ICV40PEdRKR1BJKA1DgkUhHxg4hGURjSOjAiRpCtEgNAmBxYCEPljMAhBiHwyRijNGGNJ6oBgAgVAAAvOQWBkJ02oFEBcKCzp5iiAmLcMAoAoNKjAcACA5AUwALTROKHTSe94UFYAshkzwSlJ410YFASeGUPBgAyjUImk9gCZJYAza6MAEbM0cP3PuFM6bzSNBYXmuABZUGFgiJY44WxGElucaWu8mypKkIrSW6yJxJgCKYDWQzwBYSwM01pwBNhdNZHEiZhwe7CPAQ-DSeE5AWB+CURe38-61FoYoYBOBQG30eWI5h1FYGBxCAgpBqD0GcPwQonBII5FYL2EQkYwd1ZDOtCcs5FSLm0loGQKMAYKzAwbH2Mgyyy6ByGY5AyVFaQkqDCC+lMwUj6MIOwY5pyKnnMuaRa5vjA4PNXnSyiMxM7CXpm4PMaCxV8SFd+WxqiAS9gZtadI6K4gVx1uysBxsLKm27iZEV997ZJydtKSaCBGEJGeVpd5WBbVMNZdRT8liIWoVqq6yV7kYASVtdYz+9IhmoCjohekMcvocttRQgRvcQiAy1v8wF1DRH2p8VfBIprRHyucmPSAUL8DIM6SkPNDKQTlrZb0D+Qi9H6poVW-iBbJ4WDap69WOaH7rwsHHDVGjvzHWxTylpeLOWA1PoqhNXb6YZo3ugPIH9zFKqSHYmdB8j4kNtYYsUw1EQcNlPIhUvCvJ4gEYDGdhj3zGJkQe8KR7sFKNXSq9RE6YBaKSJ4S9oLr3SKXSZD1p8RjKosmGhx1wnGIBQOgM8njSI+LiE4RGyN4iowoCozGISwmRPPjEg0cTD4JKSZPCmoAXrpMybAHJeSsCFLw4oGAZSKkUeqYXWpZN6mNJHec9pfcrk9KZizYS7MRkGmei6Hm-zplC3oHMqU4m5LuJMFLOserb4C2dOoLZKYFPQ32XSTFwnslgBxbysdGx+M3LYgck19agWrznW8-AHyTJfP-jUlNHLIE-ogOC3uRaS1oORdwvYuC4UPtRTWqx2qsVJFM6OmoryzREvrOWRsnB5w1CXEGQlVKbM0qM02xl5KGaGLU2mrlJnuPmcs1OutAKvP0ybb612MqIByu9eKrAdXybPoskyiQ9MNVToxcm7W5WRHmV0TgM29y7NptvT3R2hcKrWudUxCAOEXmkEdetq9ftAN0Way20gAaAPoo+KG8NCko2RBjSZY6hGh6vs9cmmdGbjWevq6mkRD9jtvylYg4tMKiuVs63xNFb6Z3-dcsJWk7be6dvm7935tJUD3lQPUgmYD+1vqOmyYduLEvrcnbW6bP3gWOZgONBAi6zFPow+TxrG6ayB0Oy6rru71pIkPSixUzUVTns9d+11v6TG0mCwihndiXsJvfQmHRIuuti9MZ65dQcyFBpA-YxxzjoNuP4HIOD3ihVIf8ahmAGxRMMexiROAqB8C5Nw8U-D8SaiJPAOdbJRonudOI+ffQkgKNZIKc5zGTGwDRKLFU2ugDskcYafLonwBeOdIFQzAJFn0+T24EnszbSGP3kYOic+YAACOJRlAsYD4FWAuew-GfUNX-KKgaieGoCVRumTJ5uEPnkAjLTq9R7ALACvWA6G8nPjgNwrhGYW6qHhcpRo0-dMnjgVAGVtKZQIJ4GPmVa-kx4ox4vCB5cFTb0PwPtQsb2+YHPvpvTUYAAFe-4FQDgKwlU3xnxb4VLAxU39G5fBykLZmAopkorUqojQa5IZ0QoZWZqAc8QBGNMdYAZggdPAw8wAYhL8D9wAm8QkV9WQYBu8t9mMMoDRagcp6Z4wbQcCY9f828ADSo3J0lkCAADfJAARnYOPxL2oF5ArGbywHPybxmEyQKHqCNAqTqAplyXv36SEzZmGU5iwACiDwmSkwUBmVk0lHYHUKCiU2MGWCwB2igA4GUG4AAGlGILAuDThJdj0gR-orAgZdRLojRbo1RqB2BWYso4AAB+D0B3OodAWgSwM-VvIqTvLOSAt8dgNaJkIOPLBSIZMyCwEQOTP6cAfwgI8BIQYQSPMwiw6wiIAAajKKnTGxSANWm1m1swBVtnNQSDwUimiligShvFHSykjx8MBkYOiMANiL8MYECLdhEKiP-xiPHgCICJgAAAZ1sYdGpTtgJA0LsQ0jNCd898ULBSwBtgxMtFwSs3Qhck4DiWUusaiE5rMs03sQFV4Bipihjx5m4LBuDPs5c4Y4YYAcIIAhCniaCAB1E-Q-CyRw7BRvTwIHc+VBPjdPC2DfXfZA+DePJiRPJpHY9pGggAOVWF62AFAGilHWoHvwTTDzxKylcE1TfRA3-UjUxQkAdzaJiksJTVXlaKilZPijxEXiR0aJoU5PaMsISlpBThZNihSApNJnqU5XJ0eImL-2YLKh61ukXm1wuOGy1UuyM2lKpKS1l1CnCz5xSEESHTi2q2JzBg2JsWqEpNlJpI7EgxcRgyU3oXg1N0cGQwCXQyCSxnWl6xlkUBkJYPHhrgYMtJTwYxmCgHvCwGY0phQV60xDqGpmxyinqUYDTI5liRxmrzcEGBHzROYAGGAFDLAAUNBBAO1ySMnyB3X0LAI2CV0XwHXyGGpyQHvDTzwkrKfzyE8B-GwFbMxxMRSBQRtDlm+OimHKGHyR-ldjgHqRQXGFnRADhmnLbLxEE0GSM0kLGHQEYHCX-0jN41uTOL7iMw3JHJ1DfzcCTLbRMhbjgFvKTN8CwlsBbg+FVxCBhJSG0X9X-HYD5jthrjcx+RkKYD+Sg1cSMHqMDmTRbn2xbim1NizV-P-MFBsLkFAt-n-n-CAT5kuL4hgU+OnUNE3JvLDRQWlVlRSHYIABJLB-xrB8l8ljBGLMKIg7B2CetT4AMrEPhtcryhhKK7z6Yf5CyUgW4AAdMAaSqALuXyIZDgWkHMrmbwU0j4NaFuDgFuMhd2SaQEFuVAPSiDRDHc5QgAIVUut2HE0vpG0sstMvpAMqmlIC4IDjVM1CGQ2BstULGXsoZFIBbg2Gcvx1TgiOtCDjuQ+EM2UJCQsA1Q4CnTiojmQGKygBSEsrq3DmInpiQDgCkoRDgFZApnFFCrq21wYssFQBYsYuQGsHYI2K8pJCGSwj8tGQ2QIECs+kiBbiwjCrcNNIBGivPNStgASoBBSGSpGHGr7gypSA2ByuEjyoKqKqYBKsNBylIAGsqr6xgGqtqoAH1GLgBGrmrPShkyAOqxNFBZIsAertKyBBrHsjigRIqkhRrqUk4hl8ZEqkhFrlrIBVqQBCqW5irSrtryBFLwQqqyBSBTrzqBKnTzKhkmgLA1KsBdNHqvoW5fAXq2Rfd3qRqvDvqYA5rxksYMcscNUyAgalBBs1rwaNrIbxR8a9rGd2DfAEbLB8AkaQ4zLvLrcDDMrhqorSb8sw4VrGbQapKgTSI69kCZZmBARdqRghkrMNUsIp1cqZbCreTrh2AQptL99JBiAjiPdcwIBPyUahbVCRaUgiaxbPqJbUjpaGYmb5aizc9laR9s4AAyaGnWozWACwdHVAqa4+HU5Qym8OmmgGum9W92-K2WqAYO4GvWqUoVUhBSE2q-ZIX3S286G2lqpwcUrkyUw03Wj22WvGxQOoFgSIwqHA5QNwagEpGG+kaOhmmusGgAVTbrpk4E7pCA4DEQBpbnKXRBABHt6QvIzt7qkoHvbp0ScqnUsvHsyraBuVMG3pgDKJgHsKJHYAAFZ5j5jLrLzyKRzh5eRlADyjz4seM-lL6F6U7CrhKDbHAgA)

[Playground (with atomList)]([https://www.typescriptlang.org/play?ts=4.8.0-beta#code/MYewdgzgLgBA5gGxAIwIYILIFMC2IBOAngFwwBKWo+AJgDzT4CWYcANDAIJQg7Z5EwAPjADKWBJW74+BQkPJYIIAK75gWGQOEBRAGa7JmwgD4YAXhgBvAL4BuALAAoJ1EIAHLJ245aAFVMWlk4wIQDWWCQwDMxwDo4h8FhQpAAUAJTmpr5xCRBJqQBu6MpYAPL4AGLKYMBQjOCkvvIpKSAI1I0ZZllpXaYFIIzUOSEQysgQwEzIWKlDpNEs7GAgdbqEAMLoCGjAoal9MANDh+mZR4PDTtZOLu6eXDwAMozQfgFWwWERC1BMLCMYG5lBAABaFYqzGC+Q7HK7xELVMGMXTJGApIoIEqdc5wwHMPL4KBcCFYqG+djMahYAAepDAyhwM3wsMugLcIDcB3OTWEDIQCEByNR3O60Pk-MFXxg+FwIAKWBJ6KptPpjOZh15MElgLg+XRmoA2gBdXVJJUpFV07XqrAsnlC8aTaZQy0dKJ-GLLVYozbbXb7A24y6nVlDOI3ZyOVweUTiSQEd7mT4ImDhSKLWLSvVos5i7LSsYTKaMGZzd2Z71rP0CgOi-oh855hvh663aP3BRKVTqJOBaXp37-LOpnP1mAABXwPFeWHejuLLvLQ692p96y2tdQe3HcNDwdbjkjd1jAHEklA7cmgqm-KxjCkc1BUMgJKQKN21HP-GlSFOZ3k87SneD5Pi+b5eDw7y-tCgIgY+F7gVCYgSLUiY-o0EbtjGngiIQNTTisILnlAl74NewEUqBiGvlCjw+BhsGUfeCGkUhpAoQm+DQZhbZRjhMAkc+tF9sEwj0e8YlxqhUhAfEJ4PBA+HAEJSGifE4neJJGnSVx2nyB+KhfnJCmQbwcoCP2qaYtiMDVKEKwAO5gAuzqlnaECkDeCQJIa6YwMwHrDsau5stKkbHh2sb0S80BGBR1mQqQ9lOWAJquSWzKeSmPkhH5EQBWAQUxCFQZini4WAkiTqZVgVQ1HU4DZRQVB0JWZUttQxhYfxnacWh0gWXIVkJDZUIpSAzn4hAAAijBEpEyAgG0WCoC5hY1S6+DZd5uX5XIgWZqVzYXIeCR2NK1WLu59W1PUkCpCde7pXxpmGT2GhDQlo1JXZYAOZN62pq8c0LaQS0rWtGVbTt0q+f5h2eiwx1hvC51VZAm03dUd1NY9qNpC9R7YZ2egGLU8UjSEKzVr4jA4FgKhQAAku6DJMlewjVNSujMFgaMhNSS041gM2qKgjVgGqHP4BjRZuTMt2S9lLQE0TkUCfR-5uBAfY5d8GZIyOCQ86gygIGiBbE71sb9VI2u6-430GyuALZvqKS1NalgwHDIRjqIymESoEBCXati+6m1iahHr1RZ471fg7eu7WmPzFW7o4e17XmR7liRomH5HhYc-44LO86R5FAD0ABUtfBLXChQKokAwGt7feIwwBAowlCeCAugyqtd0Kh6EtYAAdI31dOKAkCwFMq2XvRyYtAzODvpQBBtUb7D0UYxiHPBbjTjrpBa2fjtHxfWlO2KN4AJAouiACE6Kn5yECTwjRUb70+sQgb0NJ-HWP8IjGmdiER+Y1SCgO-qbc2UBWB+yiFjLKXlrAoNTDAC6CJIwhHntAdubhGDO0foOIEV9wGEGwdAvIuYxrlCVvdRozRWjtAAGq-RhDyABD84bPyHikHCg8jiQmYTjSW5gzAWAAOS6CkfdORGRU75yIbARRNRkxMMqEo8A7cIDog4dQbhZIcT5jSICBIj9gHwJocaSeY1kxaOACkOx1D0yOOcagIxMJrEhGsDAcQeRAE2I8V-BxTjIQ6IkXohq90Am4NQaUZAAArSQ0SyQQHcbgEBniIGT3lrVbaaRUGP0nroAg2htyghSDTX0m4djblCOcBpG5-QtPSFYuGWC4YBxOhEsBXisklEMdCOhuR0GunmBnNga5qxNLrB1U61BDhqKAXk+xIzikw0NEMSBFh2k1maXsVBsoW74CKidDZJt4yXhgEM7+OzpnbX2dQU0qCCHnUmXgkIFzW4kMYBGNIj4kBoEwF9Xx7cwCEB6VGOuDd4hNwoJctuqAYAIFQAALzkFgGyE9qBRGUqCYOIIojxgGjAKAoIJYwHAAgOQsoAC0+LigTyMY5UEWAio0s8GNIxYjGBQCMdSDwYBqQ1D7kY4AtKWBTzzrXWejgNEwCXhPO2BA165M3goVq9A966QGofY+VEUjwI4pS+2V8eJGtkvfUwT9VXgBmlgcVkrgCbDlXqIlFgblwyeVEkG81XDJj+CUaxqSMm1FGYoHV+TIkvOullMpOCQiVOqbU+p64TkBjaTmpZXTegjDwY-VVOZXXup5Z65MtAyAsTArRUgqkRJkCPucNRqqroK08BYRtEginTPNQU2h9KwCVp5R6r1a0fXwp8oGkZ3baosKapPYEYIUhLpdHOhIAKrkF2EgOnM6QS1xCEW-YdiaCqBX-qogNWyR2HLCTA36kpJk+WDWDal+ASjvqmcmjymC-2IkxgBldD0YAmj-X85JCJVWoFIeQyh2yIh-oGes-OIRUEv3jShwgjjP2uDvWmhIC7Clbuxgk1dVT8A1NlZu0DPbzgUZmN0pJmycAJuGeRxjy79FtwsETfOtiH1Xvw7G5M9jj23J8gHCtbrJ3VtoagwJO785kfE4R4aMBdDoDyEk75Pk91-1E9x8TPi-HWL6Tg3Z7llxzKrI0zpO4Vl7g7agjTjjbNZXeU+45hazkkeMysmTMBqQSAeZ5wdAG3kHIM7035IxgsIeBdcUFiAUDoHitCtacK4hOERY3ZurcjEYqxbi4JBLLxEt8SSslRjZSgA+tS2lsAGVMqwKyqrigYBcp5S1-lkJBVD2FaKhTErq3SrVd6hVM855NUXrKCeid1Dao3lvfV7UVufX4CYU1LELVdiMuoZOjFtt9kdU4MtC2x0TomzUad8rfUhfvZxvDBHZohu0+GrAkb0mZIFbhx90We2lNQRm2jWb-POdaWKaHW49hsa+KW8tSQ7tTtrfW6ibEm2cCUjUFtEg63toETgrtvGXTJn7VPbzWBL1mfYC68bU6NgzbWdYqLLG6r8e-uuupXO1PDzRQepCk9j07tLTh1+9PnnXpMzgABajPNQJgC+8xNoBTAYCp9r9P2te0+2kB1BXPwPZSg70ktXx4OIaphQ9OeG0P6lq9o-1JGcNRa08RzDjzTOy-EybnnEO6P84p+5ZjofWPFpUz7t7wOA9UYE5Bz5JGROx7E94mJFhUCOVQMKqhkTpPR-9vqeTVaHta9U+xmPXG-cfdBqGiwumED6a+ecpIgKosWaYjg6zPlaf2favD05gYnqNlJ+p33USDcQF88mIfAY2-C9d978LSRPBRen75+LPfEtfGS6QkFYLMuQt2+M3L8KCv1yKxsJbl5StFVWnAVA+BGWVfZdV4lNRSXgBDvS8izvZV6tgl9BJAWs6UWUf024+swB8Urw+VxFsl6URsRUwtmdJsetZUZ0p5r8ZsjFuBUCy9gAptHJGABRgkwAABHEoZQAbYA8mWAfAyAsdVbeAoWFQGoTwagcWaRWlIxNwXxPIGrCVWg2AsAWAKgrAMZV4YJHANwVwaeZFGAKoIkblciTA+VIxHAVAakGAGYGjTweArAEA2oGUJEXrUghAVA4WDgkQ4w2AVAJ-ZgBQmAJuIrAAAX4PwFQBwCsHZmZCCTYJFjFi8OkV8G5UeWYHpkZBtBliQIiIFFnHnmoDwJAF61z1gD0IIE8EgLABiFsPoOYM8AxXUL1BgF4N0KwH62pEvFqH5knjjFIjyNYKwGsPUGCIlnumpVSIAANmUABGbo8wsg6gV4JCWgwImwmYWlAoeociHlOoWURlZwpVebBeNVW-LAMmUAv1HVDbHeA1YcdgLYimIaYwZYWkYkZQbgAAaQKgsD6NOHnxaVSBzisALmbQvCvGjgPGoHYHnl5jgAAH4-xn86h0BaAfYJi2juDWEYjmR2BKFMxcESdLs4Mbt-ILARAjZPZwAATASaEhA+QLiOAriQBbjCAABqCkndKXFIX+GPRXV7faJ9W5Y5OmBmJmVmZKCbXmGA341BKE0WGEhoNVXExgIEyeQU9o6RQEwEmAAABi13j1xgg3Nx70tzRLWNL0Uwe1rTNWpwvnxxUhoiJx-HcwREfmpxB1qjpNQxezd2EWARGSlOFKKlkQsH6K90w2rmrhgDmggDGMFPqIAHULDTCioni9hCidMtUR5QRpssDHltCDDUjcs4jRsCCdSiDFB6iAA5VYYeYAUABmCbagZwzDSA-M3mVwE9aPYzbfaBMtCQZ-dkxmK4+NEZNk+mNslmdnQRJ0wpLsjkq41mZMBhVspmFISsweYVUdAc8TF0kI+6QXaOaxYLK08XU9K3G7ac6s7TZfamAtGHFIDZOTNHNA8vEuDU-5aoKs2c2so8dLcFLLKFe-PLdsQrRQ1FErduOZYeU+RQeYjogxMRZowgqbGYKARySoh-WpYebcOoMeU+emYVRgMedVD-OleAjkZgNrEbMAAYYAYCsAZY6EcI4LJE6QmjLQ0ifmM-H3fALQoYHTJARyTAokUitwvITwQ0bARi3PD5FIUEUic+H0hmfioYZlNJb+OAYVUEcYSeeoaucSpitZObFVG7GYsYdARgbFUWC87MoxP1dZbctYlSgS08LwtweMwTOGOROAKy+M3wGaWwORL4ZPEIGjdECLSDdMdgDeSBMRKNTJeYpgONDLCFIwRknBHDORafORQqBksJTyrVFIHyosckuI4KmNdMHJDea0mGaK73cyoYSyhDUENdEEOpbogAEksHTGsGZWZWMDqoyoiDsG6MF0CV6WRz33b33RKuoDKussnjSUGDABSDkQAB0wApqoAVEepVjiEMLFRvBYpYAdj1s9V9j2oYpXgoBD5ziaRLibi7iYAHjzg7wOBgljrJ0jEJJ-AHxDtL4v4-ATQb4zJ1qLt9ZnVx0DLHsfU14TKcFsqoBY08rJ8k1QcIBU184g8ocjyEdYdTBIzQgkd8Ez0pcP4R1Erb0wllcqZoFYEk9xkOA1T85p8jcSNlTlYqafIYMOMa8olnELB7FEELZJ4tC3AMRM9UT1F0SzrarLA8NrBq46qYDjqSTTrKSKTrBuikl4NvBkwVr6ITzo9KE-Lo92a0QxotdVzUFydadkwJYeACr3IZcaFGc-rCCAb+Yurq93tJ4ab7oZ8vFkwucklktvArMJdTLiEUskN7cR0-0+dSRbJeFx9cpVUMSYAhaRaxbLAJaTqySIgqS5aFabsTafCLAVbvA1aSMXY05lMC7UDdMkFSBdavl7bO9IRKqN0s77bDbpljbvAzbWMHdbt-rWcsC+ySNOcI9ucE9XaIF3aB6rMQ7ORxxblFaeA14a6yRSaTQ0g11OQHz84cMs6ZELBuYjC+Y1khdAUdQDabsudkx+7adTdDQs6HEkkuc17covbTbNyEs4YkRQQURGEeFgb+a1iY646R1RbxbiTSTyS075bj61jN6c6NjVbQsNbUMtajCzYLYK7IQ9bq7IbCkxonbIB37UQUgG6M61jT6s9W7acLa-LO6bbu6nsMG08zNHFnampmTR7adx64ZhRcxv6o7M6la-V56xloUybjRl7OH76P1hEoHZE-oeY96Mhgsj6SMm6AMz7MH-cB7L7r6vFb6B7xHd1+qipr7n6d84YCQ7RiRP71cKRCpqRrQ-C7RuGfJo7Ba6r46gHJaQHU7ZbwGlHeHZ7oHl5VqeB87vd4Hi6V8kHy6EDf0q6kkBGac3AEBu46crR2BFTO4eBG6T6B6W7TbyGO6mdqG2c6GmbF0NGecWHt6x6X6cFZQ8AFQLQrRpYNRzSf7-bvAjL0R4nF6RGilEnknLQJsaR2AHikkN6OnJ4JAWAaUt6FT5GDGNcpRfHIG+GMmcAZ95SPLcpxn-HpGd7eS7aD791FG2nYASGHa49ymh6r7W7tHjddH7bH6cAxckg9He8Eh0MmxumhGl7OaEMCG+HTAjHXnehHcLG5ghnmmHGvm1GM8F6fmRH9khnHFxc-1+9lQKxDVUbQoThWncoN9XkZ8Dk59Ebh9F9AUDz85V9ItYW26PIt9W8TGMa+rhcUtD8IqXzT8ctYUL8NK1jrqAmJ49roAQmi7SA5EOA5FJltbSATRxlMw1T9aowVrjioAWgfYcxcFuGiEVpJmQA4BWIUgOAo9Hz8sowgA](https://www.typescriptlang.org/play?ts=4.8.0-beta#code/MYewdgzgLgBA5gGxAIwIYILIFMC2IBOAngFwwBKWo+AJgDzT4CWYcANDAIJQg7Z5EwAPjADKWBJW74+BQkPJYIIAK75gWGQOEBRAGa7JmwgD4YAXhgBvAL4BuALAAoJ1EIAHLJ245aAFVMWlk4wIQDWWCQwDMxwDo4h8FhQpAAUAJTmpr5xCRBJqQBu6MpYAPL4AGLKYMBQjOCkvvIpKSAI1I0ZZllpXaYFIIzUOSEQysgQwEzIWKlDpNEs7GAgdbqEAMLoCGjAoal9MANDh+mZR4PDTtZOLu6eXDwAMozQfgFWwWERC1BMLCMYG5lBAABaFYqzGC+Q7HK7xELVMGMXTJGApIoIEqdc5wwHMPL4KBcCFYqG+djMahYAAepDAyhwM3wsMugLcIDcB3OTWEDIQCEByNR3O60Pk-MFXxg+FwIAKWBJ6KptPpjOZh15MElgLg+XRmoA2gBdXVJJUpFV07XqrAsnlC8aTaZQy0dKJ-GLLVYozbbXb7A24y6nVlDQGGq0wZge-5wY2kVBgQgRqMxhlMu0J6FxG7ORyuDyicSSAjvcyfBEwcKRRaxaV6tFnMXZaVjCZTRgzObuuvetZ+gUB0X9EPnZuj8PXW4F+4KJSqdTlwLSmu-ONmpuHAAK+B4ryw70dHZdPfXXu1PvWWyHqD2I4uJ3HYfhebuRYA4kkoHaK0Eq34rDGCkjZQKgyASKQFALmoh7+GkpC7vueRHtKgHAaB4GQV4PDvAhOZoRSGHflhUJiBItRlvBjS5jOhaeCIhA1HuKwgl+UA-vgf6EUBIEkRBUKPD41EEQBRF8RxpGkORpb4HhNHTvm9EwOxYECcuwTCEJ7yacWFFSKh8Tvg8EBMcAqmkRp8Rad4OnWXpsl2fI0EqLBhnGThvBygIK5Vpi2IwNUoQrAA7mAx7Ol2doQKQ-4JAkho1tGYCxjE2YTo+8IJHmb6zkWQkvNARjcX5kKkEFoVgCaEWdsyMWVvFISJREyWpSw6UvoCdjSkiTq1VgVQ1HU4D1RQVB0H2QZinCxi0Upc4yZR0jeXIvkJP5UIVSAYX4hAAAijBEpEyAgG0WBJjVLr4PVcWNc1cgxnWHXBlOVbdVWvUnlFg21PUkCpBlcJpNVikeS5i4aCtJXrWVgVgMF23hdKrwHUdpAnWdF1tn1V03dKCVJY9nrtQ+eLSu9CSfZFMw-cN-3ooDIYg44uXKXoBi1MVa0hCsA6+IwOBYCoUAAJLuhmzLyNU1K6MwWBZSE1IndU6h7aoqB02qmb4ICVP9bTf31S0L7A6aoN5Q83hIW4EDLg13y1sT9ZVjLqDKAgaKtizdELSWS3W7b-jQw754Ag2+opLU1qWDA+MhI20lmSxKgQKpdq2LHb2ahn5vKeDsEB3bt3Vj8bXOwkCfolHsWZ41iRomnXHkzue44AeR6Z7lAD0ABUPfBD3ChQKokAwEmY-eIwwBAowlCeCAugyudv0Kh6GtYAAdAPXdOKAkCwFM50-kJFYtILOBQZQBATU77BCUYxiHOhKRuHuNukEJhcidpQdiv+ACQKJ0QAEJ0Sv05BADehMUrn16PbEI59DTgJtlAiIxpg4hH-htUgyDIGu3dlAVgccog4yitdWK1giFVhgBTGhXw97QDHm4Rgwd-5riBG-SBNYqGYLyE2Da5QDYNHFMIFobRqAADVYYwh5HAv++NAGLxSPRBeRxISCJVnTcwZgLAAHJdCaL+rojIxc64MNgAYmoFYBGVEMeAMeEAGbiKkWSHELY0iAgSP-RBuDUGEGNBvDaFZLHABSD4zhfiAlBNQI4mEniQjWBgOIPI8CvHhIgZEwJkJrHqNsUNP68S6HUJCKUZAAArSQWSyQQDCbgJBESawBPbNTaKaRiH-w3roAg2g7yghSLzX0N4dh3lCOcAZ15-QjPSB4-GlD8aVwyuklBjSqklAcdCHhuRSHdmVL2W+l4BxDOHFNSc1BDimIQXU3xKzmn9WupGag6CLDjMHMMvYxDZTD3wClDKFyEjUgkD+GASyuFoI3rc3GDyzbFKKfFOZCJaGfJHkwxguY0ggSQGgTAUMYlj2TDM-Mvd+7xEHhQL5o9UAwAQKgAAXnILA-l17UCiGZUEycQRRD9lIGAUBQQaxgOABAchZQAFoGXFHXo4kKoIsApV5Z4DajjVGMCgI46kHgwDUhqLPRxwA+UsE3rXHuO9HDmJgIfdei1uUWDPrgS+416D7KtQQB+T9xK4OklyggX9H6ev0lRAIpgAFmvAHtLAGqtXAE2PqvUzKbXnPxiCzJKNDquArH8EonjSkVNqKsxQtScD1IyTc7ZrTiGdO6b0-pV5XkBjGTWo5UzegjHev-M1jYw0RtlVGistAyC8UwgJUgFl1JkEfucUxZq9YugrIOiQ4LS0vwaREdgobw2ysjdGpMsaCXxSTSs6d307GQA3sCMEKRD0zF3QkJF3z65qXnY2dILa4iKJAUu4tLUYywJMYmq5y7-EYJgFg2GkpNnxRTWjHl+ASjga2V9OqFC4OIkgKWoR9MTRwdoXmEIZrUDMNYew65K75kR3OXXEIxCgEFqLcssFkHXC-phZcwtxH-Eb0vQNY9kCun4B6Xqi9qGEOeDFJx6ZhSWO0dBexzj6HHEWGZnXbx-7P3saCRYXxT6-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-mMGAle0-k4T8BNF9U8nOp+3thDQlzYK3QNQh2fPihqqgDzXqu3zBWv2xzrlxzT2rUOUJ3rSJtJ1CFzwSVfT1zAQAyKpwByuoVN25kwWwTivQVxQ4AtLrmvyQ2IVNMNl5stM8WnxrybxQXwQ9g3jsLcAxBrzJLMQB0pJgD6ssDY2sC7n6oIJetZLeq5M5OsHmMKTw28ArBOqEhSFS3YW4X7IlrRA2mM1-JhV52FwrA1h4Eav6gNz8XFxp03UYKRumsj35pGmXIrE40KSf28Dnx1zvOCII25jYQDwAzgzPXBHRFZpkU30agpPepVrVo1ssC1tevZIiG5INqNt9xNosDNu8Atv7KtpIzz1ttIHtrH0DqxvczJG6r6TdvporquM41du8A9pdC9u4UB19qlzoIXOISDuzxpm41DosHDuITXQRv9tjSAu83xg5C5ADIVquN7tPhFrJHWU5uNDSFPU5C3samoyPojLhhljljOQHORR1GIWdtLQrDnuFzk0NF7siUKTE2mrXurMRs3umsjvdpvPv3xiRFBBRH4WkTP2zsVtzv6vzs1pZLZI5LLsNo-srp4FNpuPNsttLmtqbrcLdg9hbshAdvbsr3lzzQ40gAQdRBSF7ums-uEyHvduFzHv9NAdpyjQ3vlgYYLwPXnq4zd0gCXrhmF0KSEb9vBxvqK3xmFC3FcoPsYXvvRBPrWQ5pNEvo0dUYSDvqrp0UfrcOfoyGS3fqdoB0HosB-rQ0XoAcaSAakdMZCCUanqRu8dfrvQAZgctLgwJDtGJCQYtwpGSmpGtCSPtCzvihzuszzoA3Vqwe1pwdLv1vwYccPqruuKPlOp4DrrzwbqMxtqoYIVobJHocKX0aFzcAQCnhFytHYGNInh4C4ccakd4ZwBHpz0Dwnq-PAbEYaY7sT1-sXtFOXqkcUfhrAdEeoFMfnxCFlDwAVAtCtHxLtBQeScIZwHkz0cmbzTPqMfBWadactAMxpHYCBMKXMZ4EgQkBYF5W0QsENNsZP0tylHyZ0cKd7r30NMiogyUXvsselmsYVO+fJV+f7sYScfz3RxYemZkb33cbQU8f4ZAcWeEbGZWcgZ+eCaSFWaDzI3HEafOYvqlvww4artMBJagGmXJcibmFud2cSdMDRxhzOcMYvsjFuYCW1zg3UdLSX32VfLXxNi0datOev33wOSCzJuPzhZRoowv0y3lZyxv0eSHO3oRUfx+YIJChgCQhpEIAtsoVSQWQAH1bXCTS4v9ZWwX0QVFF5KTLHdEEnjFUl4oFrTmNplz9XGpYyYAojVURUNSVhZRVWytmFg3ZkKcMhcV3WUUYAAAyTyd4ZmWE1-LK8CvFSCmcM1H66ukhs6h6spkOGAXRDgXRTZZuuK3RL8AguIhABt2t-4lYZARgYBXRY0KhR23eG4145li2+uGhFBhhM6DeJAOACSFITmkF5tSrKCxwDgbuzagACXECQAOqcE3dTs2vlVlH7e-xnfnXnYxFeGUDsocsnuoJqVXfzCAA))
