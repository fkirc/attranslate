import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "./file-format-definitions";
import { TSet } from "../core/core-definitions";
import { getDebugPath, logFatal, readUtf8File } from "../util/util";
import { toJson } from "xml2json";

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
      const key = rawKey.split("_").join(".");
      tSet.set(key, value ?? null);
    });
    return tSet;
  }

  writeTFile(args: WriteTFileArgs): void {
    logFatal("Not implemented");
  }
}

function parseRawXML<T>(args: ReadTFileArgs): Partial<T> {
  const xmlString = readUtf8File(args.path);
  let jsonString;
  try {
    jsonString = toJson(xmlString);
  } catch (e) {
    console.error(e);
    logXmlError("XML parsing error", args);
  }
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error(e);
    logXmlError("Failed to convert XML into JSON", args);
  }
}

function logXmlError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}
