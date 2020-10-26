import { GetTextTranslations, po } from "gettext-parser";
import { TSet } from "../../core/core-definitions";
import { ReadTFileArgs } from "../file-format-definitions";
import { logParseError } from "../common/parse-utils";
import { traversePot } from "./po-traversal";

export function extractPotTranslations(potFile: GetTextTranslations): TSet {
  const tSet: TSet = new Map();
  traversePot(potFile, (getText) => {
    const key: string = getText.msgid;
    const value: string = getText.msgstr.join();
    if (key) {
      tSet.set(key, value);
    }
  });
  return tSet;
}

export function parsePotFile(
  args: ReadTFileArgs,
  rawFile: string
): GetTextTranslations {
  try {
    return po.parse(rawFile);
  } catch (e) {
    console.error(e);
    logParseError("GetText parsing error", args);
  }
}
