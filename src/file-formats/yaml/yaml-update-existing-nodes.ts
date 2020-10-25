import { Node, Pair, Scalar, YAMLMap } from "yaml/types";
import { isCollection, isScalar, YmlWriteContext } from "./yaml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

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

export function recursiveNodeInsert(writeContext: YmlWriteContext) {
  const currentNodes: Map<string, Node> = new Map();
  writeContext.currentPairs.forEach((pair) => {
    const subKey = pair.key?.value;
    if (typeof subKey !== "string") {
      return;
    }
    const flattenedSubkey = subKey.split(NESTED_JSON_SEPARATOR, 1)[0];
    currentNodes.set(flattenedSubkey, pair.value);
  });
  for (const jsonKey of Object.keys(writeContext.currentJson)) {
    const childJson = writeContext.currentJson[jsonKey];
    const childNode = currentNodes.get(jsonKey);
    if (!childNode && typeof childJson === "string") {
      insertScalarNode(writeContext, jsonKey, childJson);
    } else if (!childNode && childJson && typeof childJson === "object") {
      insertCollectionNode(writeContext, jsonKey);
    }
  }
  writeContext.currentPairs.forEach((pair) => {
    const subKey = pair.key?.value;
    const childJson = writeContext.currentJson[subKey];
    const node: Node = pair.value;
    if (isCollection(node) && childJson && typeof childJson === "object") {
      const childContext: YmlWriteContext = {
        ...writeContext,
        currentJson: childJson as Record<string, unknown>,
        currentPairs: node.items,
      };
      recursiveNodeInsert(childContext);
    }
  });
}

function insertScalarNode(
  writeContext: YmlWriteContext,
  key: string,
  value: string | null
) {
  writeContext.currentPairs.push(new Pair(key, new Scalar(value)));
}

function insertCollectionNode(writeContext: YmlWriteContext, key: string) {
  const yamlMap = new YAMLMap();
  writeContext.currentPairs.push(new Pair(key, yamlMap));
}
