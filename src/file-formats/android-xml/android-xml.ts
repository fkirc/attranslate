import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import {
  getDebugPath,
  logFatal,
  readUtf8File,
  writeUf8File,
} from "../../util/util";
import { toJson, toXml } from "xml2json";

interface AndroidResourceFile {
  resources: {
    string: StringResource[];
  };
}

interface StringResource {
  name: string;
  $t: string;
}

interface XmlCache {
  detectedIndent: number;
  resources: Map<string, Partial<StringResource>>;
}
const globalXmlCaches: Map<string, XmlCache> = new Map();

function lookupIndent(args: WriteTFileArgs): number {
  const sameFileCache = globalXmlCaches.get(args.path);
  if (sameFileCache) {
    return sameFileCache.detectedIndent;
  }
  const cacheArray = Array.from(globalXmlCaches);
  if (cacheArray.length) {
    return cacheArray[cacheArray.length - 1][1].detectedIndent;
  }
  return DEFAULT_ANDROID_XML_INDENT;
}

function lookupIndividualCache(
  key: string,
  cache: XmlCache
): Partial<StringResource> | null {
  return cache.resources.get(key) ?? null;
}

function lookupGlobalCache(
  key: string,
  args: WriteTFileArgs
): Partial<StringResource> | null {
  const sameFileCache = globalXmlCaches.get(args.path);
  if (sameFileCache) {
    const sameFileHit = lookupIndividualCache(key, sameFileCache);
    if (sameFileHit) {
      return sameFileHit;
    }
  }
  const cacheArray = Array.from(globalXmlCaches);
  for (let idx = cacheArray.length - 1; idx >= 0; idx--) {
    const olderCache = cacheArray[idx][1];
    const hit = lookupIndividualCache(key, olderCache);
    if (hit) {
      return hit;
    }
  }
  return null;
}

/**
 * Android Studio seems to auto-format XML-files with 4 spaces indentation.
 */
const DEFAULT_ANDROID_XML_INDENT = 4;

const ANDROID_KEY_SEPARATOR = "_";
const JSON_KEY_SEPARATOR = ".";

export class AndroidXml implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const xmlString = readUtf8File(args.path);
    const resourceFile: Partial<AndroidResourceFile> = parseRawXML<
      AndroidResourceFile
    >(xmlString, args);
    const strings = resourceFile.resources?.string;
    if (!strings || !Array.isArray(strings)) {
      logXmlError("string resources not found", args);
    }
    if (!strings.length) {
      logXmlError("string resources are empty", args);
    }

    const tSet: TSet = new Map();
    const xmlCache: XmlCache = {
      detectedIndent: detectIndent(xmlString),
      resources: new Map(),
    };
    strings.forEach((stringResource: Partial<StringResource>) => {
      const xmlKey = stringResource.name;
      const rawValue = stringResource.$t;
      const value = rawValue ? attemptToFixBrokenSanitation(rawValue) : null;
      if (!xmlKey) {
        logXmlError(`undefined key: '${stringResource}'`, args);
      }
      const jsonKey = xmlKey
        .split(ANDROID_KEY_SEPARATOR)
        .join(JSON_KEY_SEPARATOR);
      if (tSet.has(jsonKey)) {
        logXmlError(
          `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
          args
        );
      }
      tSet.set(jsonKey, value);
      xmlCache.resources.set(jsonKey, stringResource);
    });
    globalXmlCaches.set(args.path, xmlCache);
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const resources: StringResource[] = [];
    args.tSet.forEach((value, jsonKey) => {
      const cachedResource = lookupGlobalCache(jsonKey, args);
      const xmlKey = jsonKey
        .split(JSON_KEY_SEPARATOR)
        .join(ANDROID_KEY_SEPARATOR);
      const newResource: StringResource = {
        ...cachedResource,
        name: xmlKey,
        $t: value ?? "",
      };
      resources.push(newResource);
    });
    const resourceFile: AndroidResourceFile = {
      resources: {
        string: resources,
      },
    };
    const xmlString = serializeResourceFile(resourceFile, args);
    writeUf8File(args.path, xmlString);
  }
}

function serializeResourceFile(
  resourceFile: AndroidResourceFile,
  args: WriteTFileArgs
): string {
  const jsonString = JSON.stringify(resourceFile);
  const rawXmlString = toXml(jsonString, { sanitize: false });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prettifyXml = require("prettify-xml");
  const prettyXmlString = prettifyXml(rawXmlString, {
    indent: lookupIndent(args),
  });
  return `<?xml version="1.0" encoding="utf-8"?>\n${prettyXmlString}\n`;
}

function detectIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_ANDROID_XML_INDENT;
}

function parseRawXML<T>(xmlString: string, args: ReadTFileArgs): Partial<T> {
  try {
    return (toJson(xmlString, {
      object: true,
      sanitize: false,
      trim: false,
      reversible: true,
    }) as unknown) as Partial<T>;
  } catch (e) {
    console.error(e);
    logXmlError("XML parsing error", args);
  }
}

function logXmlError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}

function attemptToFixBrokenSanitation(fromXml: string) {
  /**
   * Perhaps we should use a saner XML-library which does not change any character at all.
   */
  return (
    fromXml
      //  .replace(/&quot;/g, '"')
      .replace(/&/g, "&amp;")
  );
  //.replace(/"/g, "&quot;");
}
