import { Node } from "yaml/types";
import { isCollection, isScalar, YmlWriteContext } from "./yaml-generic";

export function recursiveNodeUpdate(writeContext: YmlWriteContext) {
  writeContext.currentPairs.forEach((pair) => {
    const subKey = pair.key;
    const childJson = writeContext.currentJson[subKey?.value];
    if (childJson === undefined) {
      return;
    }
    const node: Node = pair.value;
    if (isCollection(node) && typeof childJson === "object") {
      const childContext: YmlWriteContext = {
        ...writeContext,
        currentJson: childJson as Record<string, unknown>,
        currentPairs: node.items,
      };
      recursiveNodeUpdate(childContext);
    } else if (isScalar(node) && typeof childJson !== "object") {
      node.value = childJson ?? "";
    }
  });
}

export function deleteStaleNodes(writeContext: YmlWriteContext) {
  const changeSet = writeContext.args.changeSet;
  if (!changeSet?.deleted?.size) {
    return;
  }
  changeSet.deleted.forEach((value, key) => {
    writeContext.doc.delete(key);
  });
}
