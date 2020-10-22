import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File } from "../../util/util";
import { detectSpaceIndent, parseRawXML, readNamedXmlTag } from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";

export type XmlFileCache = FileCache<NamedXmlTag, { detectedIntent: number }>;
const globalCache = new FormatCache<NamedXmlTag, { detectedIntent: number }>();

export interface NamedXmlTag {
  characterContent: string;
  attributes: { name: string };
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
const JSON_KEY_SEPARATOR = ".";

function jsonKeyToXmlKey(jsonKey: string): string {
  return jsonKey.split(JSON_KEY_SEPARATOR).join(XML_KEY_SEPARATOR);
}

export function xmlKeyToJsonKey(xmlKey: string): string {
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
    const tSet: TSet = new Map<string, string | null>();
    for (const key of Object.keys(resources)) {
      const tagArray: Partial<NamedXmlTag>[] = resources[key];
      if (Array.isArray(tagArray)) {
        for (const xmlTag of tagArray) {
          if (
            typeof xmlTag === "object" &&
            xmlTag.attributes?.name &&
            xmlTag.characterContent !== undefined &&
            typeof xmlTag.characterContent === "string"
          ) {
            readNamedXmlTag(<NamedXmlTag>xmlTag, args, fileCache, tSet);
          }
        }
      }
    }
    globalCache.insertFileCache(fileCache);
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const resources: NamedXmlTag[] = [];
    args.tSet.forEach((value, jsonKey) => {
      const cachedResource = globalCache.lookup({
        path: args.path,
        key: jsonKey,
      });
      const xmlKey = jsonKeyToXmlKey(jsonKey);
      const newResource: NamedXmlTag = {
        attributes: { ...cachedResource?.attributes, name: xmlKey },
        characterContent: value ?? "",
      };
      resources.push(newResource);
    });
    // TODO: Re-implement
    /*const resourceFile: XmlResourceFile = {
      resources: {
        string: resources,
      },
    };
    const intent =
      globalCache.lookupAuxdata({ path: args.path })?.detectedIntent ??
      DEFAULT_ANDROID_XML_INDENT;
    writeXmlResourceFile(resourceFile, args, intent);*/
  }
}
