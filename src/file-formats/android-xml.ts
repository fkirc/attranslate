import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "./file-format-definitions";
import { TSet } from "../core/core-definitions";
import {
  getDebugPath,
  logFatal,
  readUtf8File,
  writeUf8File,
} from "../util/util";
import { toJson, toXml } from "xml2json";

interface AndroidResourceFile {
  resources: {
    string: StringResource[];
  };
}

interface StringResource {
  name: string;
  formatted?: string;
  $t: string;
}

interface XmlCache {
  detectedIndent: number;
  resources: Map<string, Partial<StringResource>>;
}
const globalXmlCaches = new Map<string, XmlCache>();

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
      const rawKey = stringResource.name;
      const value = stringResource.$t;
      if (!rawKey) {
        logXmlError(`undefined key: '${stringResource}'`, args);
      }
      const key = rawKey.split(ANDROID_KEY_SEPARATOR).join(JSON_KEY_SEPARATOR);
      tSet.set(key, value ?? null);
      xmlCache.resources.set(key, stringResource);
    });
    globalXmlCaches.set(args.path, xmlCache);
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    const xmlCache: XmlCache | undefined = globalXmlCaches.get(args.path);
    const resources: StringResource[] = [];
    args.tSet.forEach((value, jsonKey) => {
      const androidKey = jsonKey
        .split(JSON_KEY_SEPARATOR)
        .join(ANDROID_KEY_SEPARATOR);
      resources.push({
        name: androidKey,
        formatted: "false",
        $t: value ?? "",
      });
    });
    const resourceFile: AndroidResourceFile = {
      resources: {
        string: resources,
      },
    };
    const jsonString = JSON.stringify(resourceFile);
    const rawXmlString = toXml(jsonString, { sanitize: true });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prettifyXml = require("prettify-xml");
    const prettyXmlString = prettifyXml(rawXmlString, {
      indent: xmlCache?.detectedIndent ?? DEFAULT_ANDROID_XML_INDENT,
    });
    const xmlString = `<?xml version="1.0" encoding="utf-8"?>\n${prettyXmlString}\n`;
    writeUf8File(args.path, xmlString);
  }
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
      sanitize: true,
      trim: false,
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
