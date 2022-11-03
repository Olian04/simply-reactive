import type { AtomMemory } from "./types/AtomMemory";
import type { EffectMemory } from "./types/EffectMemory";
import type { ResourceMemory } from "./types/ResourceMemory";
import type { SelectorMemory } from "./types/SelectorMemory";

export const globalMemory: Record<string, AtomMemory | SelectorMemory | ResourceMemory | EffectMemory> = {};
