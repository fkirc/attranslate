import {
  DEFAULT_ANDROID_XML_INDENT,
  NamedXmlTag,
  XmlCache,
  xmlKeyToJsonKey,
} from "./android-xml";
import { ReadTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";

export async function parseRawXML<T>(
  xmlString: string,
  args: ReadTFileArgs
): Promise<Partial<T>> {
  try {
    const options: OptionsV2 = {
      strict: true,
      async: false,
      //explicitChildren: true, // if true, then the resulting object will be entirely different
      preserveChildrenOrder: true,
      headless: true,
      //emptyTag: " ",
      includeWhiteChars: true,
      trim: false,
      normalize: false,
      normalizeTags: false,
      attrkey: "attributes",
      charkey: "characterContent",
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const xml2js = require("xml2js");
    const result = await xml2js.parseStringPromise(xmlString, options);
    return result as Partial<T>;
  } catch (e) {
    console.error(e);
    logParseError("XML parsing error", args);
  }
}

export function parseStringResources(
  strings: Partial<NamedXmlTag>[],
  args: ReadTFileArgs,
  xmlCache: XmlCache
): TSet {
  const tSet: TSet = new Map();
  strings.forEach((stringResource: Partial<NamedXmlTag>) => {
    const xmlKey = stringResource?.attributes?.name;
    const rawValue = stringResource.characterContent;
    const value = rawValue ?? null;
    if (!xmlKey) {
      logParseError(`undefined key: '${stringResource}'`, args);
    }
    const jsonKey = xmlKeyToJsonKey(xmlKey);
    if (tSet.has(jsonKey)) {
      logParseError(
        `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
        args
      );
    }
    tSet.set(jsonKey, value);
    xmlCache.entries.set(jsonKey, stringResource);
  });
  return tSet;
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_ANDROID_XML_INDENT;
}
