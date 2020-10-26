import { Node, Pair } from "yaml/types";
import {
  isCollection,
  isPair,
  isScalar,
  isSequence,
  YmlWriteContext,
} from "./yaml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

function getSubKey(pair: Pair): string {
  if (typeof pair.key === "string") {
    return pair.key;
  }
  return pair.key?.value;
}

export function recursiveNodeUpdate(writeContext: YmlWriteContext) {
  const node = writeContext.currentNode;
  if (!node) {
    return;
  }
  if (isScalar(node)) {
    const value = writeContext.args.tSet.get(writeContext.partialKey);
    if (value !== undefined) {
      node.value = value;
    }
  }
  if (isPair(node)) {
    const subKey = getSubKey(node);
    let partialKey: string;
    if (writeContext.partialKey.length) {
      partialKey = writeContext.partialKey + NESTED_JSON_SEPARATOR + subKey;
    } else {
      partialKey = subKey;
    }
    recursiveNodeUpdate({
      ...writeContext,
      currentNode: node.value as Node,
      partialKey,
    });
  }
  if (isCollection(node)) {
    node.items.forEach((childNode, idx) => {
      let partialKey = `${writeContext.partialKey}`;
      if (isSequence(node)) {
        partialKey += `[${idx}]`;
      }
      recursiveNodeUpdate({
        ...writeContext,
        currentNode: childNode,
        partialKey: partialKey,
      });
    });
  }
}
