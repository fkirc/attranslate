import { TSet } from "./core-definitions";

export type DiffStrategy =
  | "COMPARE_KEYS"
  | "COMPARE_VALUES"
  | "COMPARE_KEYS_AND_VALUES";

export function selectLeftDistinct(
  left: TSet,
  right: TSet,
  strategy: DiffStrategy
): TSet {
  const leftDistinct = new Map<string, string | null>();
  left.forEach((value, key) => {
    const rightT = right.get(key);
    let diff: boolean;
    if (strategy === "COMPARE_KEYS") {
      diff = !rightT;
    } else if (strategy === "COMPARE_VALUES") {
      diff = rightT !== undefined && rightT !== value;
    } else {
      diff = !rightT || rightT !== value;
    }
    if (diff) {
      leftDistinct.set(key, value);
    }
  });
  return leftDistinct;
}

export function leftJoin(left: TSet, right: TSet): TSet {
  const leftJoin = new Map<string, string | null>();
  left.forEach((value, key) => {
    leftJoin.set(key, value);
  });
  right.forEach((value, key) => {
    if (leftJoin.get(key) === undefined) {
      leftJoin.set(key, value);
    }
  });
  return leftJoin;
}

export function leftMinusRightFillNull(left: TSet, right: TSet): TSet {
  const leftRemaining = new Map<string, string | null>();
  left.forEach((value, key) => {
    if (!right.get(key)) {
      leftRemaining.set(key, value);
    } else {
      leftRemaining.set(key, null);
    }
  });
  return leftRemaining;
}

export function areEqual(set1: TSet, set2: TSet | null): boolean {
  if (!set2) {
    return false;
  }
  if (set1.size !== set2.size) {
    return false;
  }
  for (const key1 of set1.keys()) {
    const value1 = set1.get(key1);
    const value2 = set2.get(key1);
    if (value1 !== value2) {
      return false;
    }
  }
  return true;
}
