import {
  DEFAULT_XML_INDENT,
  sharedXmlOptions,
  XmlFileCache,
  XmlTag,
  XmlCacheEntry,
  PartialCacheEntry,
  XmlResourceFile,
  defaultKeyAttribute,
  defaultRootTagName,
} from "./android-xml";
import { ReadTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";
import { NESTED_JSON_SEPARATOR } from "../../util/flatten";

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

export function extractRootTags(
  args: ReadTFileArgs,
  xmlFile: Partial<XmlResourceFile>
): { resources: Record<string, Partial<XmlTag>[]>; rootTagName: string } {
  const defaultRoot = xmlFile[defaultRootTagName];
  if (typeof defaultRoot === "object") {
    return { resources: defaultRoot, rootTagName: defaultRootTagName };
  }
  for (const key of Object.keys(xmlFile)) {
    const value = xmlFile[key];
    if (typeof value === "object") {
      return { resources: value, rootTagName: key };
    }
  }
  const msg = "Did not find an extractable tag-object";
  logParseError(msg, args);
}

export interface XmlReadContext {
  tSet: TSet;
  fileCache: XmlFileCache;
  args: ReadTFileArgs;
  arrayName: string;
  parentTag: XmlTag | null;
}

export function readResourceTag(xmlContext: XmlReadContext, tag: XmlTag) {
  const cacheEntry: PartialCacheEntry = {
    arrayName: xmlContext.arrayName,
    parentTag: tag,
  };
  if (Array.isArray(tag.item) && tag.item.length) {
    readNestedTag(xmlContext, cacheEntry, tag.item);
  } else {
    readFlatTag(xmlContext, cacheEntry, tag);
  }
}

function readFlatTag(
  xmlContext: XmlReadContext,
  cacheEntry: PartialCacheEntry,
  tag: XmlTag
) {
  insertXmlContent(
    xmlContext,
    { ...cacheEntry, type: "FLAT", childTag: null, childOffset: 0 },
    tag.characterContent
  );
}

function readNestedTag(
  xmlContext: XmlReadContext,
  cacheEntry: PartialCacheEntry,
  childs: XmlTag[] | string[]
) {
  childs.forEach((child: XmlTag | string, index: number) => {
    if (typeof child === "string") {
      insertXmlContent(
        xmlContext,
        {
          ...cacheEntry,
          type: "STRING_ARRAY",
          childTag: null,
          childOffset: index,
        },
        child
      );
    } else if (
      typeof child === "object" &&
      typeof child.characterContent === "string"
    ) {
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
    }
  });
}

let fallbackCounter = 0;
function getFallbackKey(): string {
  fallbackCounter += 1;
  return `xml_key_${fallbackCounter}`;
}

function getDefaultKey(cacheEntry: PartialCacheEntry): string | null {
  const attributes = cacheEntry.parentTag?.attributes;
  if (typeof attributes !== "object") {
    return null;
  }
  return attributes[defaultKeyAttribute] ?? null;
}

function xmlToFlatJsonKey(cacheEntry: XmlCacheEntry): string {
  return getDefaultKey(cacheEntry) ?? getFallbackKey();
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
