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

const ANDROID_KEY_SEPARATOR = "_";
const JSON_KEY_SEPARATOR = ".";

export class AndroidXml implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const resourceFile: Partial<AndroidResourceFile> = parseRawXML<
      AndroidResourceFile
    >(args);
    const strings = resourceFile.resources?.string;
    if (!strings || !Array.isArray(strings)) {
      logXmlError("string resources not found", args);
    }
    if (!strings.length) {
      logXmlError("string resources are empty", args);
    }

    const tSet: TSet = new Map();
    strings.forEach((stringResource: Partial<StringResource>) => {
      const rawKey = stringResource.name;
      const value = stringResource.$t;
      if (!rawKey) {
        logXmlError(`undefined key: '${stringResource}'`, args);
      }
      const key = rawKey.split(ANDROID_KEY_SEPARATOR).join(JSON_KEY_SEPARATOR);
      tSet.set(key, value ?? null);
    });
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
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
    const xmlString = toXml(jsonString, { sanitize: true });
    writeUf8File(args.path, xmlString);
  }
}

function parseRawXML<T>(args: ReadTFileArgs): Partial<T> {
  const xmlString = readUtf8File(args.path);
  try {
    return (toJson(xmlString, {
      object: true,
      sanitize: true,
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
