import { DEFAULT_XML_INDENT, sharedXmlOptions, XmlTag } from "./xml-generic";
import { ReadTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { OptionsV2 } from "xml2js";
import {
  constructJsonKey,
  TraverseXmlContext,
  traverseXml,
} from "./xml-traverse";

export async function parseRawXML<T>(
  xmlString: string,
  args: ReadTFileArgs
): Promise<T> {
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
    return result as T;
  } catch (e) {
    console.error(e);
    logParseError("XML parsing error", args);
  }
}

export function extractXmlContent(args: {
  args: ReadTFileArgs;
  xmlFile: XmlTag;
}): TSet {
  const tSet: TSet = new Map();
  const context: TraverseXmlContext = {
    keyFragments: [],
    operation: (context, xmlTag) => {
      const key = constructJsonKey(context);
      if (tSet.has(key)) {
        logParseError(
          `duplicate key '${key}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
          args.args
        );
      }
      if (typeof xmlTag === "string") {
        tSet.set(key, xmlTag);
      } else {
        tSet.set(key, xmlTag.characterContent ?? "");
      }
    },
  };
  traverseXml({
    context,
    tag: args.xmlFile,
    oldTargetTag: null,
  });
  return tSet;
}

export function detectSpaceIndent(xmlString: string): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const detectModule = require("detect-indent");
  return detectModule(xmlString).amount ?? DEFAULT_XML_INDENT;
}

export function extractFirstLine(str: string) {
  return str.split("\n", 1)[0];
}
