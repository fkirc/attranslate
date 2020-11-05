import { XmlLayer, XmlTag } from "./android-xml";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

export interface TraverseXmlContext {
  keyFragments: string[];
  operation: (context: TraverseXmlContext, xmlTag: XmlTag) => void;
}

export function constructJsonKey(context: TraverseXmlContext) {
  return context.keyFragments.join(NESTED_JSON_SEPARATOR);
}

export function traverseXmlLayer(args: {
  context: TraverseXmlContext;
  layer: XmlLayer;
  oldTargetLayer: XmlLayer | null;
}) {
  for (const contentKey of Object.keys(args.layer)) {
    const xmlContent = args.layer[contentKey];
    if (xmlContent && Array.isArray(xmlContent) && xmlContent.length) {
      xmlContent.forEach((tag: XmlTag, index: number) => {
        traverseXmlTag({
          context: {
            keyFragments: [
              ...args.context.keyFragments,
              contentKey + "_" + index,
            ],
            operation: args.context.operation,
          },
          tag,
          oldTargetTag: null,
        });
      });
    } else if (typeof xmlContent === "object") {
      traverseXmlLayer({
        context: {
          keyFragments: [...args.context.keyFragments, contentKey],
          operation: args.context.operation,
        },
        layer: (xmlContent as unknown) as XmlLayer,
        oldTargetLayer: null,
      });
    }
  }
}

function traverseXmlTag(args: {
  context: TraverseXmlContext;
  tag: XmlTag;
  oldTargetTag: XmlTag | null;
}) {
  const tag = args.tag;
  if (typeof tag === "string") {
    args.context.operation(args.context, tag);
  } else if (Array.isArray(tag.item) && tag.item.length) {
    traverseXmlLayer({
      context: args.context,
      layer: tag.item,
      oldTargetLayer: null,
    });
  } else {
    args.context.operation(args.context, tag);
  }
}
