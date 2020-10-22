import {
  DEFAULT_ANDROID_XML_INDENT,
  NamedXmlTag,
  sharedXmlOptions,
  XmlFileCache,
  xmlKeyToJsonKey,
  XmlTag,
  XmlTagType,
} from "./android-xml";
import { ReadTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";

export async function parseRawXML<T>(
  xmlString: string,
  args: ReadTFileArgs
): Promise<Partial<T>> {
  try {
    const options: OptionsV2 = {
      ...sharedXmlOptions,
      strict: true,
      async: false,
      //explicitChildren: true, // if true, then the resulting object will be entirely different
      preserveChildrenOrder: true,
      headless: true,
      //emptyTag: " ",
      includeWhiteChars: true,
      trim: false,
      normalize: false,
      normalizeTags: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const xml2js = require("xml2js");
    const result = await xml2js.parseStringPromise(xmlString, options);
    return result as Partial<T>;
  } catch (e) {
    console.error(e);
    logParseError("XML parsing error", args);
  }
}

export interface XmlContext {
  tSet: TSet;
  fileCache: XmlFileCache;
  args: ReadTFileArgs;
}

export function readNamedXmlTag(xmlContext: XmlContext, tag: NamedXmlTag) {
  if (Array.isArray(tag.item) && tag.item.length) {
    const firstChild = tag.item[0];
    if (typeof firstChild === "string") {
      return readStringArrayTag(xmlContext, tag, tag.item as string[]);
    }
    if (
      typeof firstChild === "object" &&
      typeof firstChild.attributes === "object" &&
      typeof firstChild.characterContent === "string"
    ) {
      return readNestedTag(xmlContext, tag, tag.item as XmlTag[]);
    }
  }
  return readFlatTag(xmlContext, tag);
}

function readFlatTag(xmlContext: XmlContext, tag: NamedXmlTag) {
  const xmlKey = tag.attributes.name;
  const { jsonKey } = insertTSet(
    xmlContext,
    "FLAT",
    xmlKey,
    tag.characterContent
  );
  xmlContext.fileCache.entries.set(jsonKey, tag);
}

function readStringArrayTag(
  xmlContext: XmlContext,
  parentTag: NamedXmlTag,
  items: string[]
) {
  const cacheKey = parentTag.attributes.name + "___string-array-cache"; // TODO
  xmlContext.fileCache.entries.set(cacheKey, parentTag);
  items.forEach((item, index) => {
    const stringItemKey: string = [
      parentTag.attributes.name,
      `string_item_${index}`,
    ].join("####");
    insertTSet(xmlContext, "STRING_ARRAY", stringItemKey, item);
  });
}

function readNestedTag(
  xmlContext: XmlContext,
  parentTag: NamedXmlTag,
  childs: XmlTag[]
) {
  childs.forEach((child, index) => {
    const childKey =
      `XML_CHILD_` + parentTag.attributes.name + "_string_item_" + index; // TODO
    insertTSet(xmlContext, "NESTED", childKey, child.characterContent);
  });
}

function insertTSet(
  xmlContext: XmlContext,
  type: XmlTagType,
  xmlKey: string,
  value: string | null
): { jsonKey: string } {
  const jsonKey = xmlKeyToJsonKey(type, xmlKey);
  if (xmlContext.tSet.has(jsonKey)) {
    logParseError(
      `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
      xmlContext.args
    );
  }
  xmlContext.tSet.set(jsonKey, value);
  return { jsonKey };
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_ANDROID_XML_INDENT;
}
