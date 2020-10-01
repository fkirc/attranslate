import { TSet } from "./core-definitions";
import { logFatal } from "../util/util";

export type DiffStrategy =
  | "COMPARE_KEYS"
  | "COMPARE_VALUES"
  | "COMPARE_KEYS_AND_VALUES";

export function selectLeftDistinct(
  left: TSet,
  right: TSet,
  strategy: DiffStrategy
): TSet {
  if (strategy !== "COMPARE_KEYS") {
    if (left.lng !== right.lng) {
      logFatal("Cannot compare values of different languages");
    }
  }
  const leftDistinct = new Map<string, string>();
  left.translations.forEach((value, key) => {
    const rightT: string | undefined = right.translations.get(key);
    let diff: boolean;
    if (strategy === "COMPARE_KEYS") {
      diff = !rightT;
    } else if (strategy === "COMPARE_VALUES") {
      diff = !!rightT && rightT !== value;
    } else {
      diff = !rightT || rightT !== value;
    }
    if (diff) {
      leftDistinct.set(key, value);
    }
  });
  return {
    lng: left.lng,
    translations: leftDistinct,
  };
}

export function leftJoin(left: TSet, right: TSet): TSet {
  if (left.lng !== right.lng) {
    logFatal("Cannot join different languages");
  }
  const leftJoin = new Map<string, string>();
  left.translations.forEach((value, key) => {
    leftJoin.set(key, value);
  });
  right.translations.forEach((value, key) => {
    if (leftJoin.get(key) === undefined) {
      leftJoin.set(key, value);
    }
  });
  return {
    lng: left.lng,
    translations: leftJoin,
  };
}

export function areEqual(set1: TSet, set2: TSet | null): boolean {
  if (!set2) {
    return false;
  }
  if (set1.lng !== set2.lng) {
    return false;
  }
  if (set1.translations.size !== set2.translations.size) {
    return false;
  }
  for (const key1 of set1.translations.keys()) {
    const value1 = set1.translations.get(key1);
    const value2 = set2.translations.get(key1);
    if (value1 !== value2) {
      return false;
    }
  }
  return true;
}
