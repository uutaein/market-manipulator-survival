export interface SeededRandom {
  readonly seed: string;
  next(): number;
  nextInt(minInclusive: number, maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  fork(namespace: string): SeededRandom;
}

export function createSeededRandom(seed: string): SeededRandom {
  let state = hashStringToUint32(seed) || 0x9e3779b9;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    seed,
    next,
    nextInt(minInclusive: number, maxExclusive: number): number {
      if (maxExclusive <= minInclusive) {
        throw new Error("maxExclusive must be greater than minInclusive");
      }

      return Math.floor(next() * (maxExclusive - minInclusive)) + minInclusive;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error("Cannot pick from an empty collection");
      }

      return items[this.nextInt(0, items.length)];
    },
    shuffle<T>(items: readonly T[]): T[] {
      const shuffled = [...items];

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = this.nextInt(0, index + 1);
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }

      return shuffled;
    },
    fork(namespace: string): SeededRandom {
      return createSeededRandom(`${seed}:${namespace}`);
    }
  };
}

function hashStringToUint32(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
