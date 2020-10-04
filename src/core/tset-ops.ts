import { TSet } from "./core-definitions";
import { logFatal } from "../util/util";
import { getElementPosition, insertAt } from "./core-util";

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
  const join = new Map<string, string | null>();
  left.forEach((value, key) => {
    join.set(key, value);
  });
  right.forEach((value, key) => {
    if (join.get(key) === undefined) {
      join.set(key, value);
    }
  });
  return join;
}

export function leftJoinPreserveOldTargetOrder(args: {
  translateResults: TSet;
  oldTarget: TSet;
  src: TSet;
}): TSet {
  // To prevent file-scrambling, we have to preserve the order of the old target.
  const targetOrder: string[] = [];
  args.oldTarget.forEach((value, key) => {
    targetOrder.push(key);
  });

  const newlyAdded = extractNewlyAddedTranslations({
    translateResults: args.translateResults,
    oldTarget: args.oldTarget,
  });

  // Newly added translations are more flexible in its position.
  // Therefore, we try to mimic the order of src.
  injectNewKeysIntoTargetOrder({
    targetOrder,
    newlyAdded,
    oldTarget: args.oldTarget,
    src: args.src,
  });

  // Create an in-order map out of the determined targetOrder
  const joinResult = new Map<string, string | null>();
  targetOrder.forEach((key) => {
    const freshResult = args.translateResults.get(key);
    const oldResult = args.oldTarget.get(key);
    if (freshResult) {
      joinResult.set(key, freshResult);
    } else if (oldResult) {
      joinResult.set(key, oldResult);
    } else {
      logFatal(`Invalid targetOrder for key ${key}`);
    }
  });
  // Add any remaining newly added translations whose target order was not determined.
  newlyAdded.forEach((value, key) => {
    if (joinResult.get(key) === undefined) {
      joinResult.set(key, value);
    }
  });
  return joinResult;
}

function injectNewKeysIntoTargetOrder(args: {
  targetOrder: string[];
  newlyAdded: TSet;
  oldTarget: TSet;
  src: TSet;
}) {
  let injectPosition = 0;
  args.src.forEach((srcValue, srcKey) => {
    if (args.oldTarget.get(srcKey) !== undefined) {
      injectPosition =
        1 +
        getElementPosition({
          array: args.targetOrder,
          element: srcKey,
        });
    }
    if (args.newlyAdded.get(srcKey) !== undefined) {
      insertAt(args.targetOrder, injectPosition, srcKey);
      injectPosition++;
    }
  });
}

function extractNewlyAddedTranslations(args: {
  translateResults: TSet;
  oldTarget: TSet;
}): TSet {
  const newlyAdded = new Map<string, string | null>();
  args.translateResults.forEach((value, key) => {
    if (args.oldTarget.get(key) === undefined) {
      newlyAdded.set(key, value);
    }
  });
  return newlyAdded;
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

export function areEqual(set1: TSet, set2: TSet): boolean {
  for (const key1 of set1.keys()) {
    const value1 = set1.get(key1);
    const value2 = set2.get(key1);
    if (value1 !== value2) {
      return false;
    }
  }
  return true;
}
