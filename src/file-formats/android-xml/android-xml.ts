import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File } from "../../util/util";
import {
  detectSpaceIndent,
  extractFirstLine,
  extractRootTags,
  parseRawXML,
  readResourceTag,
  XmlReadContext,
} from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { OptionsV2 } from "xml2js";
import {
  writeResourceTag,
  writeXmlResourceFile,
  XmlWriteContext,
} from "./xml-write";

export type XmlTagType = "FLAT" | "STRING_ARRAY" | "NESTED";

export interface PartialCacheEntry {
  arrayName: string;
  parentTag: XmlTag;
}
export interface XmlCacheEntry extends PartialCacheEntry {
  type: XmlTagType;
  childTag: XmlTag | null;
  childOffset: number;
}
export interface XmlAuxData {
  xmlHeader: string | null;
  detectedIntent: number;
  resourceFile: XmlResourceFile;
  rootTagName: string;
}

export type XmlFileCache = FileCache<XmlCacheEntry, XmlAuxData>;
const globalCache = new FormatCache<XmlCacheEntry, XmlAuxData>();

export const defaultKeyAttribute = "name";
export const defaultRootTagName = "resources";

export type XmlTag =
  | string // string in case of tags without any attributes
  | {
      characterContent: string;
      attributes: Record<string, string>;
      item?: XmlTag[];
    };
export const sharedXmlOptions: OptionsV2 = {
  attrkey: "attributes",
  charkey: "characterContent",
};

export interface XmlResourceFile {
  [prop: string]: {
    [prop: string]: Partial<XmlTag>[];
  };
}

/**
 * Android Studio seems to auto-format XML-files with 4 spaces indentation.
 */
export const DEFAULT_XML_INDENT = 4;
export const DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';

export class AndroidXml implements TFileFormat {
  async readTFile(args: ReadTFileArgs): Promise<TSet> {
    const xmlString = readUtf8File(args.path);
    const resourceFile = await parseRawXML<XmlResourceFile>(xmlString, args);
    const { resources, rootTagName } = extractRootTags(args, resourceFile);
    const firstLine = extractFirstLine(xmlString);
    const fileCache: XmlFileCache = {
      path: args.path,
      auxData: {
        xmlHeader: firstLine.includes("<?") ? firstLine : null,
        resourceFile: resourceFile as XmlResourceFile,
        detectedIntent: detectSpaceIndent(xmlString),
        rootTagName,
      },
      entries: new Map(),
    };
    const readContext: XmlReadContext = {
      tSet: new Map(),
      fileCache,
      args,
      arrayName: "",
      parentTag: null,
    };
    for (const arrayName of Object.keys(resources)) {
      const tagArray: Partial<XmlTag>[] = resources[arrayName];
      if (Array.isArray(tagArray)) {
        for (const xmlTag of tagArray) {
          readContext.arrayName = arrayName;
          readResourceTag(readContext, <XmlTag>xmlTag);
        }
      }
    }
    globalCache.insertFileCache(readContext.fileCache);
    return readContext.tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const auxData = globalCache.lookupAuxdata({ path: args.path });
    const resources = {};
    const resourceFile: XmlResourceFile = {
      [auxData?.rootTagName ?? defaultRootTagName]: resources,
    };
    const writeContext: XmlWriteContext = {
      args,
      resources,
      cacheEntry: null,
      jsonKey: "",
      value: null,
    };
    args.tSet.forEach((value, jsonKey) => {
      writeContext.cacheEntry = globalCache.lookup({
        path: args.path,
        key: jsonKey,
      });
      writeContext.jsonKey = jsonKey;
      writeContext.value = value;
      writeResourceTag(writeContext);
    });
    writeXmlResourceFile(resourceFile, args, auxData);
  }
}
