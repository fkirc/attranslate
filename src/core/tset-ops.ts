import { TChangeSet, TSet } from "./core-definitions";
import { getElementPosition, insertAt } from "./core-util";

export type DiffStrategy =
  | "COMPARE_KEYS"
  | "COMPARE_VALUES"
  | "COMPARE_KEYS_AND_NULL_VALUES";

export function selectLeftDistinct(
  left: TSet,
  right: TSet,
  strategy: DiffStrategy
): TSet {
  const leftDistinct = new Map<string, string | null>();
  left.forEach((leftValue, key) => {
    const rightValue = right.get(key);
    const distinct = compareLeftRight({ leftValue, rightValue, strategy });
    if (distinct) {
      leftDistinct.set(key, leftValue);
    }
  });
  return leftDistinct;
}

function compareLeftRight(args: {
  leftValue: string | null;
  rightValue: string | null | undefined;
  strategy: DiffStrategy;
}): boolean {
  switch (args.strategy) {
    case "COMPARE_KEYS":
      return args.rightValue === undefined;
    case "COMPARE_KEYS_AND_NULL_VALUES":
      return (
        args.rightValue === undefined ||
        (args.rightValue === null && args.leftValue !== null)
      );
    case "COMPARE_VALUES":
      return (
        args.rightValue !== undefined && args.leftValue !== args.rightValue
      );
  }
}

export function joinResultsPreserveOrder(args: {
  translateResults: TSet;
  changeSet: TChangeSet;
  oldTarget: TSet;
  src: TSet;
}): TSet {
  // To prevent file-scrambling, we have to preserve the order of the old target.
  const targetOrder: string[] = [];
  args.oldTarget.forEach((value, key) => {
    targetOrder.push(key);
  });

  // Newly added translations are more flexible in its position.
  // Therefore, we try to mimic the order of src.
  injectNewKeysIntoTargetOrder({
    targetOrder,
    newlyAdded: args.changeSet.added,
    oldTarget: args.oldTarget,
    src: args.src,
  });

  // Create an in-order map out of the determined targetOrder
  const joinResult = new Map<string, string | null>();
  targetOrder.forEach((key) => {
    const freshResult = args.translateResults.get(key);
    const oldResult = args.oldTarget.get(key);
    if (freshResult !== undefined) {
      joinResult.set(key, freshResult);
    } else if (oldResult !== undefined) {
      joinResult.set(key, oldResult);
    }
  });
  // Add any remaining newly added translations whose target order was not determined.
  args.changeSet.added.forEach((value, key) => {
    if (!joinResult.has(key)) {
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

export function leftMinusRight(left: TSet, right: TSet): TSet {
  const leftRemaining = new Map<string, string | null>();
  left.forEach((value, key) => {
    if (!right.has(key)) {
      leftRemaining.set(key, value);
    }
  });
  return leftRemaining;
}

export function areEqual(set1: TSet, set2: TSet): boolean {
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
  for (const key2 of set2.keys()) {
    const value1 = set1.get(key2);
    const value2 = set2.get(key2);
    if (value1 !== value2) {
      return false;
    }
  }
  return true;
}
