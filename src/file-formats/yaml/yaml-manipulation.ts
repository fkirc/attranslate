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

export function updateYmlNodes(args: {
  args: WriteTFileArgs;
  sourceYml: Parsed;
  oldTargetYml: Parsed | null;
}) {
  const rootContext: TraverseYmlContext = {
    partialKey: "",
    node: getRootNode(args.sourceYml),
    oldTargetNode: args.oldTargetYml ? getRootNode(args.oldTargetYml) : null,
  };
  traverseYml(rootContext, (innerContext, scalar) => {
    const value = args.args.tSet.get(innerContext.partialKey);
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
  if (context.oldTargetNode?.type !== node.type) {
    context.oldTargetNode = null; // Just a safety measure
  }
  if (context.oldTargetNode?.comment) {
    node.comment = context.oldTargetNode.comment;
  }
  if (context.oldTargetNode?.commentBefore) {
    node.commentBefore = context.oldTargetNode.commentBefore;
  }
  if (context.oldTargetNode?.spaceBefore) {
    node.spaceBefore = context.oldTargetNode.spaceBefore;
  }
  // if (context.oldTargetNode?.cstNode) {
  //   node.cstNode = context.oldTargetNode.cstNode;
  // }
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
    let oldTargetPair: Pair | null = null;
    if (
      isPair(context.oldTargetNode) &&
      getPairKey(context.oldTargetNode) === pairKey
    ) {
      oldTargetPair = context.oldTargetNode;
    }
    traverseYml(
      {
        node: node.value as Node | null,
        oldTargetNode: oldTargetPair
          ? (oldTargetPair.value as Node | null)
          : null,
        partialKey,
      },
      operation
    );
  }
  if (isCollection(node)) {
    node.items.forEach((childNode: Node, idx) => {
      let partialKey = `${context.partialKey}`;
      if (isSequence(node)) {
        partialKey += `[${idx}]`;
      }
      let oldTargetChild: Node | null = null;
      if (isCollection(context.oldTargetNode)) {
        oldTargetChild = findMatchingOldTargetChild(
          context.oldTargetNode.items,
          childNode,
          idx
        );
      }
      traverseYml(
        {
          node: childNode,
          oldTargetNode: oldTargetChild,
          partialKey: partialKey,
        },
        operation
      );
    });
  }
}

function findMatchingOldTargetChild(
  oldTargetItems: Node[],
  child: Node,
  idx: number
): Node | null {
  if (!isPair(child)) {
    if (idx >= oldTargetItems.length) {
      return null;
    }
    const candidateChild = oldTargetItems[idx];
    if (candidateChild.type !== child.type) {
      return null;
    }
    return candidateChild;
  } else {
    const candidatePairs: Pair[] = oldTargetItems.filter((node) =>
      isPair(node)
    ) as Pair[];
    const matchingPair = candidatePairs.find(
      (pair) => getPairKey(pair) === getPairKey(child)
    );
    return matchingPair ?? null;
  }
}

function getPairKey(pair: Pair): string {
  if (typeof pair.key === "string") {
    return pair.key;
  }
  return pair.key?.value;
}
