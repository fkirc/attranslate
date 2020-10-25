import { Node, Pair, Scalar, YAMLMap } from "yaml/types";
import { isCollection, isScalar, YmlWriteContext } from "./yaml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";
import { Type } from "yaml/util";

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
  const currentNodes = extractNodeMap(writeContext);
  for (const jsonKey of Object.keys(writeContext.currentJson)) {
    const childJson = writeContext.currentJson[jsonKey];
    const childNode = currentNodes.get(jsonKey);
    if (!childNode && typeof childJson === "string") {
      insertScalarNode(writeContext, jsonKey);
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

function extractNodeMap(writeContext: YmlWriteContext): Map<string, Node> {
  const nodeMap: Map<string, Node> = new Map();
  writeContext.currentPairs.forEach((pair) => {
    const subKey = pair.key?.value;
    if (typeof subKey !== "string") {
      return;
    }
    const flattenedSubkey = subKey.split(NESTED_JSON_SEPARATOR, 1)[0];
    nodeMap.set(flattenedSubkey, pair.value);
  });
  return nodeMap;
}

function insertScalarNode(writeContext: YmlWriteContext, key: string) {
  const value = writeContext.currentJson[key];
  const scalar = new Scalar(value);
  scalar.type = Type.QUOTE_SINGLE;
  insertPreserveOrder(writeContext, key, scalar);
}

function insertCollectionNode(writeContext: YmlWriteContext, key: string) {
  const yamlMap = new YAMLMap();
  insertPreserveOrder(writeContext, key, yamlMap);
}

function insertPreserveOrder(
  writeContext: YmlWriteContext,
  newKey: string,
  newNode: Node
) {
  const newPair = new Pair(newKey, newNode);
  const currentPairs = writeContext.currentPairs;
  const keyBefore = findKeyBefore(writeContext.currentJson, newKey);
  if (!keyBefore) {
    writeContext.currentPairs = [newPair, ...currentPairs];
    return;
  }
  for (let idx = 0; idx < currentPairs.length; idx++) {
    const pair = currentPairs[idx];
    if (pair.key === keyBefore) {
      writeContext.currentPairs = [
        ...currentPairs.slice(0, idx),
        newPair,
        ...currentPairs.slice(idx),
      ];
      return;
    }
  }
  writeContext.currentPairs.push(newPair);
}

function findKeyBefore(
  obj: Record<string, unknown>,
  key: string
): string | null {
  let prevKey: string | null = null;
  for (const objKey of Object.keys(obj)) {
    if (objKey === key) {
      return prevKey;
    }
    prevKey = objKey;
  }
  return null;
}
