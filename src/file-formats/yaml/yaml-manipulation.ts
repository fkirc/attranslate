import { Node, Pair } from "yaml/types";
import { isCollection, isScalar, YmlWriteContext } from "./yaml-generic";

function getSubKey(pair: Pair): string {
  if (typeof pair.key === "string") {
    return pair.key;
  }
  return pair.key?.value;
}

export function recursiveNodeUpdate(writeContext: YmlWriteContext) {
  writeContext.currentNode.items.forEach((pair) => {
    const childJson = writeContext.currentJson[getSubKey(pair)];
    if (childJson === undefined) {
      return;
    }
    const node: Node = pair.value;
    if (isCollection(node) && typeof childJson === "object") {
      const childContext: YmlWriteContext = {
        ...writeContext,
        currentJson: childJson as Record<string, unknown>,
        currentNode: node,
      };
      recursiveNodeUpdate(childContext);
    } else if (isScalar(node) && typeof childJson !== "object") {
      node.value = childJson ?? "";
    }
  });
}
