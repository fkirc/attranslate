import {
  defaultExcludedContentKey,
  defaultKeyAttribute,
  XmlTag,
} from "./xml-generic";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

export interface TraverseXmlContext {
  keyFragments: string[];
  operation: (context: TraverseXmlContext, xmlTag: XmlTag) => void;
}

export function constructJsonKey(context: TraverseXmlContext) {
  return context.keyFragments.join(NESTED_JSON_SEPARATOR);
}

export function traverseXml(args: {
  context: TraverseXmlContext;
  tag: XmlTag;
  oldTargetTag: XmlTag | null;
}) {
  if (typeof args.tag !== "object") {
    return;
  }
  for (const contentKey of Object.keys(args.tag)) {
    const xmlContent = args.tag[contentKey];
    if (typeof xmlContent === "object") {
      traverseXmlTag({
        context: args.context,
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

function traverseXmlTag(args: {
  context: TraverseXmlContext;
  tag: XmlTag;
  oldTargetTag: XmlTag | null;
}) {
  if (typeof args.tag === "string") {
    args.context.operation(args.context, args.tag);
  } else {
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
          const newKeyFragments: string[] = [];
          const attributeKey = extractAttributeKey(childTag);
          if (attributeKey) {
            if (contentKey !== defaultExcludedContentKey) {
              newKeyFragments.push(contentKey);
            }
            newKeyFragments.push(attributeKey);
          } else {
            newKeyFragments.push(contentKey + "_" + index);
          }
          traverseXmlTag({
            context: {
              keyFragments: [...args.context.keyFragments, ...newKeyFragments],
              operation: args.context.operation,
            },
            tag: childTag,
            oldTargetTag: null,
          });
        });
      }
    }
    if (!hasChildTags) {
      // Detected a leaf-tag
      args.context.operation(args.context, args.tag);
    }
  }
}
