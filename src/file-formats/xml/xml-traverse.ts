import {
  defaultExcludedContentKey,
  defaultKeyAttribute,
  XmlTag,
} from "./xml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

interface TraverseXmlContext {
  keyFragments: string[];
  operation: XmlOperation;
}

export type XmlOperation = (
  context: TraverseXmlContext,
  xmlTag: XmlTag
) => string | null;

export function constructJsonKey(context: TraverseXmlContext) {
  return context.keyFragments.join(NESTED_JSON_SEPARATOR);
}

export function traverseXml(args: {
  xml: XmlTag;
  oldTargetXml: XmlTag | null;
  operation: XmlOperation;
}) {
  if (typeof args.xml !== "object") {
    return;
  }
  const context: TraverseXmlContext = {
    keyFragments: [],
    operation: args.operation,
  };
  for (const contentKey of Object.keys(args.xml)) {
    const xmlContent = args.xml[contentKey];
    if (typeof xmlContent === "object") {
      traverseRecursive({
        context,
        tag: (xmlContent as unknown) as XmlTag,
        oldTargetTag: (extractOldTargetObject(
          args.oldTargetXml,
          contentKey
        ) as unknown) as XmlTag | null,
      });
    }
  }
}

function traverseRecursive(args: {
  context: TraverseXmlContext;
  tag: XmlTag;
  oldTargetTag: XmlTag | null;
}) {
  if (typeof args.tag !== "object") {
    return;
  }
  if (typeof args.oldTargetTag !== typeof args.tag) {
    args.oldTargetTag = null;
  } else if (args.oldTargetTag && typeof args.oldTargetTag === "object") {
    if (typeof args.oldTargetTag.attributes === "object") {
      args.tag.attributes = {
        ...args.tag.attributes,
        ...args.oldTargetTag.attributes,
      };
    }
    if (
      args.oldTargetTag.comments &&
      Array.isArray(args.oldTargetTag.comments) &&
      args.oldTargetTag.comments.length
    ) {
      args.tag.comments = args.oldTargetTag.comments;
    }
  }
  let hasChildTags = false;
  for (const contentKey of Object.keys(args.tag)) {
    const xmlContent = args.tag[contentKey];
    if (
      contentKey !== "comments" &&
      xmlContent &&
      Array.isArray(xmlContent) &&
      xmlContent.length
    ) {
      const oldTargetChilds = extractOldTargetObject(
        args.oldTargetTag,
        contentKey
      );
      hasChildTags = true;
      xmlContent.forEach((sourceChild: XmlTag, index: number) => {
        const newKeyFragments = constructKeyFragments({
          tag: sourceChild,
          contentKey,
          index,
        });
        const newContext: TraverseXmlContext = {
          keyFragments: [...args.context.keyFragments, ...newKeyFragments],
          operation: args.context.operation,
        };
        if (typeof sourceChild === "string") {
          const newContent = args.context.operation(newContext, sourceChild);
          if (newContent !== null) {
            xmlContent[index] = newContent;
          }
        } else {
          traverseRecursive({
            context: newContext,
            tag: sourceChild,
            oldTargetTag: extractOldTargetChild({
              oldTargetChilds,
              sourceChild,
              index,
            }),
          });
        }
      });
    }
  }
  if (!hasChildTags) {
    const newContent = args.context.operation(args.context, args.tag);
    if (newContent !== null) {
      args.tag.characterContent = newContent;
    }
  }
}

function extractAttributeKey(tag: XmlTag): string | null {
  if (typeof tag !== "object") {
    return null;
  }
  const attributes = tag.attributes;
  if (!attributes || typeof attributes !== "object") {
    return null;
  }
  return attributes[defaultKeyAttribute] ?? null;
}

function constructKeyFragments(args: {
  tag: XmlTag;
  contentKey: string;
  index: number;
}): string[] {
  const keyFragments: string[] = [];
  const attributeKey = extractAttributeKey(args.tag);
  if (attributeKey) {
    if (args.contentKey !== defaultExcludedContentKey) {
      keyFragments.push(args.contentKey);
    }
    keyFragments.push(attributeKey);
  } else {
    keyFragments.push(args.contentKey + "_" + args.index);
  }
  return keyFragments;
}

function extractOldTargetObject(
  oldTargetXml: XmlTag | null,
  contentKey: string
): XmlTag[] | XmlTag | null {
  if (!oldTargetXml) {
    return null;
  }
  if (typeof oldTargetXml !== "object") {
    return null;
  }
  const xmlContent = oldTargetXml[contentKey];
  if (xmlContent && typeof xmlContent === "object") {
    return xmlContent;
  }
  return null;
}

function extractOldTargetChild(args: {
  oldTargetChilds: XmlTag[] | XmlTag | null;
  sourceChild: XmlTag;
  index: number;
}): XmlTag | null {
  if (!args.oldTargetChilds) {
    return null;
  }
  if (!Array.isArray(args.oldTargetChilds)) {
    return null;
  }
  if (!args.oldTargetChilds.length) {
    return null;
  }
  const sourceAttributeKey = extractAttributeKey(args.sourceChild);
  if (sourceAttributeKey) {
    return (
      args.oldTargetChilds.find((oldTargetChild) => {
        const oldTargetAttributeKey = extractAttributeKey(oldTargetChild);
        return (
          oldTargetAttributeKey && oldTargetAttributeKey === sourceAttributeKey
        );
      }) ?? null
    );
  } else if (args.oldTargetChilds.length > args.index) {
    return args.oldTargetChilds[args.index];
  } else {
    return null;
  }
}
