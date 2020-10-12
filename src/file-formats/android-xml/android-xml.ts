import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath, logFatal, readUtf8File } from "../../util/util";
import { insertNewXmlCache, lookupStringResource, XmlCache } from "./xml-cache";
import { writeXmlResourceFile } from "./xml-write";
import {
  detectSpaceIndent,
  parseRawXML,
  parseStringResources,
} from "./xml-read";

export interface XmlResourceFile {
  resources: {
    string: StringResource[];
  };
}

export interface StringResource {
  name: string;
  $t: string;
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
  readTFile(args: ReadTFileArgs): TSet {
    const xmlString = readUtf8File(args.path);
    const resourceFile: Partial<XmlResourceFile> = parseRawXML<XmlResourceFile>(
      xmlString,
      args
    );
    const xmlCache: XmlCache = {
      path: args.path,
      detectedIndent: detectSpaceIndent(xmlString),
      resources: new Map(),
    };
    const strings = resourceFile.resources?.string;
    if (!strings || !Array.isArray(strings)) {
      logXmlError("string resources not found", args);
    }
    if (!strings.length) {
      logXmlError("string resources are empty", args);
    }

    const tSet = parseStringResources(strings, args, xmlCache);
    insertNewXmlCache(xmlCache);
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const resources: StringResource[] = [];
    args.tSet.forEach((value, jsonKey) => {
      const cachedResource = lookupStringResource(jsonKey, args);
      const xmlKey = jsonKeyToXmlKey(jsonKey);
      const newResource: StringResource = {
        ...cachedResource,
        name: xmlKey,
        $t: value ?? "",
      };
      resources.push(newResource);
    });
    const resourceFile: XmlResourceFile = {
      resources: {
        string: resources,
      },
    };
    writeXmlResourceFile(resourceFile, args);
  }
}

export function logXmlError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}
