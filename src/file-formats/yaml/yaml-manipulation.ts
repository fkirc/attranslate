import { Node, Pair, Scalar } from "yaml/types";
import { isCollection, isPair, isScalar, isSequence } from "./yaml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";
import { Document } from "yaml";
import Parsed = Document.Parsed;
import { TSet } from "../../core/core-definitions";
import { logFatal } from "../../util/util";
import { WriteTFileArgs } from "../file-format-definitions";

export function extractYmlNodes(document: Parsed): TSet {
  const tSet: TSet = new Map();
  const rootContext: TraverseYmlContext = {
    partialKey: "",
    node: getRootNode(document),
    oldTargetNode: null,
  };
  traverseYml(rootContext, (innerContext, scalar) => {
    const value = scalar.value;
    if (typeof value === "string") {
      tSet.set(innerContext.partialKey, value);
    }
  });
  return tSet;
}

export function updateYmlNodes(args: WriteTFileArgs, document: Parsed) {
  const rootContext: TraverseYmlContext = {
    partialKey: "",
    node: getRootNode(document),
    oldTargetNode: null,
  };
  traverseYml(rootContext, (innerContext, scalar) => {
    const value = args.tSet.get(innerContext.partialKey);
    if (value !== undefined) {
      scalar.value = value;
    }
  });
}

function getRootNode(document: Parsed): Node {
  const root: Node | null = document.contents;
  if (!root) {
    logFatal("root node not found");
  }
  if (!isScalar(root) && !isCollection(root) && !isPair(root)) {
    logFatal("root node invalid");
  }
  return root;
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
