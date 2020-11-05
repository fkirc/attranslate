import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import {
  detectSpaceIndent,
  extractFirstLine,
  extractXmlContent,
  parseRawXML,
} from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { OptionsV2 } from "xml2js";
import { updateXmlContent, writeXmlResourceFile } from "./xml-write";
import { readManagedUtf8 } from "../common/managed-utf8";

export interface XmlAuxData {
  xmlHeader: string | null;
  detectedIntent: number;
  xmlFile: XmlFile;
}

export type XmlFileCache = FileCache<unknown, XmlAuxData>;
const xmlCache = new FormatCache<unknown, XmlAuxData>();

export const defaultKeyAttribute = "name";
export const defaultExcludedContentKey = "string";

export type XmlFile = Record<string, XmlTag>;

export const sharedXmlOptions: OptionsV2 = {
  attrkey: "attributesObj",
  charkey: "characterContent",
};
export type XmlTag =
  | string
  | (Record<string, XmlTag[] | undefined> & {
      characterContent: string;
      attributesObj?: Record<string, string>;
      comments?: string[];
    });

/**
 * Android Studio seems to auto-format XML-files with 4 spaces indentation.
 */
export const DEFAULT_XML_INDENT = 4;
export const DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';

export class XmlGeneric implements TFileFormat {
  async readTFile(args: ReadTFileArgs): Promise<TSet> {
    const xmlString = readManagedUtf8(args.path);
    const xmlFile = await parseRawXML<XmlFile>(xmlString, args);
    if (!xmlFile) {
      return new Map();
    }
    const firstLine = extractFirstLine(xmlString);
    const fileCache: XmlFileCache = {
      path: args.path,
      auxData: {
        xmlHeader: firstLine.includes("<?") ? firstLine : null,
        xmlFile,
        detectedIntent: detectSpaceIndent(xmlString),
      },
      entries: new Map(),
    };
    xmlCache.insertFileCache(fileCache);
    return extractXmlContent({ args, xmlFile });
  }

  writeTFile(args: WriteTFileArgs): void {
    const sourceXml = xmlCache.getOldestAuxdata()?.xmlFile;
    let resultXml: XmlFile;
    if (sourceXml) {
      resultXml = this.extractCachedXml(args, sourceXml);
    } else {
      resultXml = this.createUncachedXml(args);
    }
    writeXmlResourceFile(
      resultXml,
      args,
      xmlCache.lookupAuxdata({ path: args.path })
    );
    xmlCache.purge();
  }

  extractCachedXml(args: WriteTFileArgs, sourceXml: XmlFile): XmlFile {
    const oldTargetXml =
      xmlCache.lookupSameFileAuxdata({
        path: args.path,
      })?.xmlFile ?? null;
    updateXmlContent({ args, sourceXml, oldTargetXml });
    return sourceXml;
  }

  createUncachedXml(args: WriteTFileArgs): XmlFile {
    const tagArray: XmlTag[] = [];
    args.tSet.forEach((value, key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tagArray.push({
        characterContent: value ?? "",
        attributesObj: { name: key },
      });
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rootTag: XmlTag = {
      string: tagArray,
    };
    return {
      resources: rootTag,
    };
  }
}
