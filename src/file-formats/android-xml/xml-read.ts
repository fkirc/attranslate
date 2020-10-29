import {
  DEFAULT_XML_INDENT,
  NamedXmlTag,
  XmlFileCache,
  XmlTag,
  XmlCacheEntry,
  PartialCacheEntry,
} from "./android-xml";
import { ReadTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { parse, X2jOptionsOptional } from "fast-xml-parser";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

export function parseRawXML<T>(
  xmlString: string,
  args: ReadTFileArgs
): Partial<T> {
  try {
    const options: X2jOptionsOptional = {
      ignoreNameSpace: true,
      ignoreAttributes: false,
      allowBooleanAttributes: true,
      parseNodeValue: false,
      parseAttributeValue: false,
      trimValues: false,
    };
    const result = parse(xmlString, options, true);
    return result as Partial<T>;
  } catch (e) {
    console.error(e);
    logParseError("XML parsing error", args);
  }
}

export interface XmlReadContext {
  tSet: TSet;
  fileCache: XmlFileCache;
  args: ReadTFileArgs;
  arrayName: string;
  parentTag: NamedXmlTag | null;
}

export function readResourceTag(xmlContext: XmlReadContext, tag: NamedXmlTag) {
  const cacheEntry: PartialCacheEntry = {
    arrayName: xmlContext.arrayName,
    parentTag: tag,
  };
  if (Array.isArray(tag.item) && tag.item.length) {
    const firstChild = tag.item[0];
    if (typeof firstChild === "string") {
      return readStringArrayTag(xmlContext, cacheEntry, tag.item as string[]);
    }
    if (
      typeof firstChild === "object" &&
      typeof firstChild.attributes === "object" &&
      typeof firstChild.characterContent === "string"
    ) {
      return readNestedTag(xmlContext, cacheEntry, tag.item as XmlTag[]);
    }
  }
  return readFlatTag(xmlContext, cacheEntry, tag);
}

function readFlatTag(
  xmlContext: XmlReadContext,
  cacheEntry: PartialCacheEntry,
  tag: NamedXmlTag
) {
  insertXmlContent(
    xmlContext,
    { ...cacheEntry, type: "FLAT", childTag: null, childOffset: 0 },
    tag.characterContent
  );
}

function readStringArrayTag(
  xmlContext: XmlReadContext,
  cacheEntry: PartialCacheEntry,
  items: string[]
) {
  items.forEach((item, index) => {
    insertXmlContent(
      xmlContext,
      {
        ...cacheEntry,
        type: "STRING_ARRAY",
        childTag: null,
        childOffset: index,
      },
      item
    );
  });
}

function readNestedTag(
  xmlContext: XmlReadContext,
  cacheEntry: PartialCacheEntry,
  childs: XmlTag[]
) {
  childs.forEach((child, index) => {
    insertXmlContent(
      xmlContext,
      {
        ...cacheEntry,
        type: "NESTED",
        childTag: child,
        childOffset: index,
      },
      child.characterContent
    );
  });
}

function xmlToFlatJsonKey(cacheEntry: XmlCacheEntry): string {
  return cacheEntry.parentTag?.attributes.name ?? "_";
}

function xmlToNestedJsonKey(cacheEntry: XmlCacheEntry): string {
  return [
    cacheEntry.arrayName,
    xmlToFlatJsonKey(cacheEntry),
    `item_${cacheEntry.childOffset}`,
  ].join(NESTED_JSON_SEPARATOR);
}

function cacheEntryToJsonKey(cacheEntry: XmlCacheEntry): string {
  /**
   * The JSON-key is only relevant if we convert from XML into other file-formats,
   * and then it might be subject to personal taste.
   * If we stay within XML, then the JSON-key does not matter as long as it remains unique.
   */
  switch (cacheEntry.type) {
    case "FLAT":
      return xmlToFlatJsonKey(cacheEntry);
    case "NESTED":
      return xmlToNestedJsonKey(cacheEntry);
    case "STRING_ARRAY":
      return xmlToNestedJsonKey(cacheEntry);
  }
}

function insertXmlContent(
  xmlContext: XmlReadContext,
  cacheEntry: XmlCacheEntry,
  value: string | null
) {
  const jsonKey: string = cacheEntryToJsonKey(cacheEntry);
  if (xmlContext.tSet.has(jsonKey)) {
    logParseError(
      `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
      xmlContext.args
    );
  }
  xmlContext.tSet.set(jsonKey, value);
  xmlContext.fileCache.entries.set(jsonKey, cacheEntry);
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_XML_INDENT;
}

export function extractFirstLine(str: string) {
  return str.split("\n", 1)[0];
}
