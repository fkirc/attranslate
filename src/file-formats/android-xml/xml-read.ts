import {
  DEFAULT_ANDROID_XML_INDENT,
  NamedXmlTag,
  sharedXmlOptions,
  XmlFileCache,
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
      ...sharedXmlOptions,
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

export function readNamedXmlTag(
  tag: NamedXmlTag,
  args: ReadTFileArgs,
  fileCache: XmlFileCache,
  tSet: TSet
) {
  const xmlKey = tag.attributes.name;
  const jsonKey = xmlKeyToJsonKey(xmlKey);
  if (tSet.has(jsonKey)) {
    logParseError(
      `duplicate key '${jsonKey}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
      args
    );
  }
  tSet.set(xmlKey, tag.characterContent);
  fileCache.entries.set(jsonKey, tag);
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_ANDROID_XML_INDENT;
}
