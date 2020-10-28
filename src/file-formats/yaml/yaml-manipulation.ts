import { Node, Pair, Scalar } from "yaml/types";
import {
  isCollection,
  isPair,
  isScalar,
  isSequence,
  YmlWriteContext,
} from "./yaml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

export function updateYmlNodes(writeContext: YmlWriteContext) {
  const outerContext: TraverseYmlContext = {
    partialKey: "",
    node: writeContext.currentNode,
    oldTargetNode: null,
  };
  traverseYml(outerContext, (innerContext, scalar) => {
    const value = writeContext.args.tSet.get(innerContext.partialKey);
    if (value !== undefined) {
      scalar.value = value;
    }
  });
}

interface TraverseYmlContext {
  partialKey: string;
  node: Node | null;
  oldTargetNode: Node | null;
}

function traverseYml(
  context: TraverseYmlContext,
  operation: (context: TraverseYmlContext, scalar: Scalar) => void
) {
  const node = context.node;
  if (!node) {
    return;
  }
  if (isScalar(node)) {
    operation(context, node);
  }
  if (isPair(node)) {
    const pairKey = getPairKey(node);
    let partialKey: string;
    if (context.partialKey.length) {
      partialKey = context.partialKey + NESTED_JSON_SEPARATOR + pairKey;
    } else {
      partialKey = pairKey;
    }
    traverseYml(
      {
        ...context,
        node: node.value as Node | null,
        partialKey,
      },
      operation
    );
  }
  if (isCollection(node)) {
    node.items.forEach((childNode, idx) => {
      let partialKey = `${context.partialKey}`;
      if (isSequence(node)) {
        partialKey += `[${idx}]`;
      }
      traverseYml(
        {
          ...context,
          node: childNode,
          partialKey: partialKey,
        },
        operation
      );
    });
  }
}

function getPairKey(pair: Pair): string {
  if (typeof pair.key === "string") {
    return pair.key;
  }
  return pair.key?.value;
}
