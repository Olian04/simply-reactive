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
