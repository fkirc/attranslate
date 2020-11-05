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
  oldXml: XmlTag | null;
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
        oldTargetTag: null,
      });
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

function traverseRecursive(args: {
  context: TraverseXmlContext;
  tag: XmlTag;
  oldTargetTag: XmlTag | null;
}) {
  if (typeof args.tag !== "object") {
    return;
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
      hasChildTags = true;
      xmlContent.forEach((childTag: XmlTag, index: number) => {
        const newKeyFragments = constructKeyFragments({
          tag: childTag,
          contentKey,
          index,
        });
        const newContext: TraverseXmlContext = {
          keyFragments: [...args.context.keyFragments, ...newKeyFragments],
          operation: args.context.operation,
        };
        if (typeof childTag === "string") {
          const newContent = args.context.operation(newContext, childTag);
          if (newContent !== null) {
            xmlContent[index] = newContent;
          }
        } else {
          traverseRecursive({
            context: newContext,
            tag: childTag,
            oldTargetTag: null,
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
