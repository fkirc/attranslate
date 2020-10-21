import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File } from "../../util/util";
import { writeXmlResourceFile } from "./xml-write";
import {
  detectSpaceIndent,
  parseRawXML,
  parseStringResources,
} from "./xml-read";
import { FileCache, FormatCache } from "../common/format-cache";
import { logParseError } from "../common/parse-utils";

const globalCache = new FormatCache<
  Partial<NamedXmlTag>,
  { detectedIntent: number }
>();

export interface XmlCache
  extends FileCache<Partial<NamedXmlTag>, { detectedIntent: number }> {}

export interface XmlResourceFile {
  resources: {
    string: NamedXmlTag[];
  };
}

export interface NamedXmlTag {
  _: string;
  $: { name: string };
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
    const xmlCache: XmlCache = {
      path: args.path,
      auxData: { detectedIntent: detectSpaceIndent(xmlString) },
      entries: new Map(),
    };
    const strings = resourceFile.resources?.string;
    if (!strings || !Array.isArray(strings)) {
      logParseError("string resources not found", args);
    }
    if (!strings.length) {
      logParseError("string resources are empty", args);
    }
    const tSet = parseStringResources(strings, args, xmlCache);
    globalCache.insertFileCache(xmlCache);
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
        $: { ...cachedResource?.$, name: xmlKey },
        _: value ?? "",
      };
      resources.push(newResource);
    });
    const resourceFile: XmlResourceFile = {
      resources: {
        string: resources,
      },
    };
    const intent =
      globalCache.lookupAuxdata({ path: args.path })?.detectedIntent ??
      DEFAULT_ANDROID_XML_INDENT;
    writeXmlResourceFile(resourceFile, args, intent);
  }
}
