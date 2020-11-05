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
  extractXmlContent,
  parseRawXML,
} from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { OptionsV2 } from "xml2js";
import { updateXmlContent, writeXmlResourceFile } from "./xml-write";

export interface XmlAuxData {
  xmlHeader: string | null;
  detectedIntent: number;
  xmlFile: XmlTag;
}

export type XmlFileCache = FileCache<unknown, XmlAuxData>;
const xmlCache = new FormatCache<unknown, XmlAuxData>();

export const defaultKeyAttribute = "name";
export const defaultExcludedContentKey = "string";

export const sharedXmlOptions: OptionsV2 = {
  attrkey: "attributes",
  charkey: "characterContent",
};

export type XmlTag =
  | string
  | (Record<string, XmlTag[] | undefined> & {
      characterContent: string;
      attributes?: Record<string, string>;
    });

/**
 * Android Studio seems to auto-format XML-files with 4 spaces indentation.
 */
export const DEFAULT_XML_INDENT = 4;
export const DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';

export class AndroidXml implements TFileFormat {
  async readTFile(args: ReadTFileArgs): Promise<TSet> {
    const xmlString = readUtf8File(args.path);
    const xmlFile = await parseRawXML<XmlTag>(xmlString, args);
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
    let resultXml: XmlTag;
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

  extractCachedXml(args: WriteTFileArgs, sourceXml: XmlTag): XmlTag {
    // const oldTargetXml = xmlCache.lookupSameFileAuxdata({
    //   path: args.path, // TODO: Preserve old target attributes
    // });
    updateXmlContent({ args, xmlFile: sourceXml });
    return sourceXml;
  }

  createUncachedXml(args: WriteTFileArgs): XmlTag {
    throw Error("createUncachedXml not implemented");
  }
}
