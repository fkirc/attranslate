import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File } from "../../util/util";
import {
  detectSpaceIndent,
  parseRawXML,
  readResourceTag,
  XmlReadContext,
} from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";
import { writeResourceTag, writeXmlResourceFile } from "./xml-write";

export type XmlTagType = "FLAT" | "STRING_ARRAY" | "NESTED";

export interface PartialCacheEntry {
  arrayName: string;
  parentTag: NamedXmlTag;
}

export interface XmlCacheEntry extends PartialCacheEntry {
  type: XmlTagType;
  childTag: XmlTag | null;
  childOffset: number;
}

export type XmlFileCache = FileCache<XmlCacheEntry, { detectedIntent: number }>;
const globalCache = new FormatCache<
  XmlCacheEntry,
  { detectedIntent: number }
>();

export interface XmlTag {
  characterContent: string;
  attributes: Record<string, string>;
}

export interface NamedXmlTag {
  characterContent: string;
  attributes: { name: string };
  item?: string[] | XmlTag[];
}
export const sharedXmlOptions: OptionsV2 = {
  attrkey: "attributes",
  charkey: "characterContent",
};

export interface XmlResourceFile {
  resources: {
    [prop: string]: Partial<NamedXmlTag>[];
  };
}

/**
 * Android Studio seems to auto-format XML-files with 4 spaces indentation.
 */
export const DEFAULT_ANDROID_XML_INDENT = 4;

const XML_KEY_SEPARATOR = "_";
export const JSON_KEY_SEPARATOR = ".";

export function jsonToXmlKey(jsonKey: string): string {
  return jsonKey.split(JSON_KEY_SEPARATOR).join(XML_KEY_SEPARATOR);
}

export function xmlToJsonKey(xmlKey: string): string {
  return xmlKey.split(XML_KEY_SEPARATOR).join(JSON_KEY_SEPARATOR);
}

export class AndroidXml implements TFileFormat {
  async readTFile(args: ReadTFileArgs): Promise<TSet> {
    const xmlString = readUtf8File(args.path);
    const resourceFile: Partial<XmlResourceFile> = await parseRawXML<
      XmlResourceFile
    >(xmlString, args);
    const fileCache: XmlFileCache = {
      path: args.path,
      auxData: { detectedIntent: detectSpaceIndent(xmlString) },
      entries: new Map(),
    };
    const resources = resourceFile.resources;
    if (!resources) {
      logParseError("resources-tag not found", args);
    }
    if (typeof resources !== "object") {
      logParseError("resources-tag is not an object", args);
    }
    const xmlContext: XmlReadContext = {
      tSet: new Map(),
      fileCache,
      args,
      arrayName: "",
      parentTag: null,
    };
    for (const arrayName of Object.keys(resources)) {
      const tagArray: Partial<NamedXmlTag>[] = resources[arrayName];
      if (Array.isArray(tagArray)) {
        for (const xmlTag of tagArray) {
          if (
            typeof xmlTag === "object" &&
            xmlTag.attributes?.name &&
            xmlTag.characterContent !== undefined &&
            typeof xmlTag.characterContent === "string"
          ) {
            xmlContext.arrayName = arrayName;
            readResourceTag(xmlContext, <NamedXmlTag>xmlTag);
          }
        }
      }
    }
    globalCache.insertFileCache(xmlContext.fileCache);
    return xmlContext.tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const resourceFile: XmlResourceFile = {
      resources: {},
    };
    args.tSet.forEach((value, jsonKey) => {
      const cacheEntry = globalCache.lookup({
        path: args.path,
        key: jsonKey,
      });
      writeResourceTag(resourceFile, cacheEntry, jsonKey, value);
    });
    const auxData = globalCache.lookupAuxdata({ path: args.path });
    writeXmlResourceFile(resourceFile, args, auxData);
  }
}
