import {
  DEFAULT_ANDROID_XML_INDENT,
  logXmlError,
  StringResource,
  xmlKeyToJsonKey,
} from "./android-xml";
import { ReadTFileArgs } from "../file-format-definitions";
import { toJson } from "xml2json";
import { XmlCache } from "./xml-cache";
import { TSet } from "../../core/core-definitions";

export function parseRawXML<T>(
  xmlString: string,
  args: ReadTFileArgs
): Partial<T> {
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

export function parseStringResources(
  strings: Partial<StringResource>[],
  args: ReadTFileArgs,
  xmlCache: XmlCache
): TSet {
  const tSet: TSet = new Map();
  strings.forEach((stringResource: Partial<StringResource>) => {
    const xmlKey = stringResource.name;
    const rawValue = stringResource.$t;
    const value = rawValue ? attemptToFixBrokenSanitation(rawValue) : null;
    if (!xmlKey) {
      logXmlError(`undefined key: '${stringResource}'`, args);
    }
    const jsonKey = xmlKeyToJsonKey(xmlKey);
    if (tSet.has(jsonKey)) {
      logXmlError(
        `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
        args
      );
    }
    tSet.set(jsonKey, value);
    xmlCache.resources.set(jsonKey, stringResource);
  });
  return tSet;
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_ANDROID_XML_INDENT;
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
