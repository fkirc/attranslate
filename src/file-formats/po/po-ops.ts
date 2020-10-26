import { GetTextTranslation, GetTextTranslations, po } from "gettext-parser";
import { TSet } from "../../core/core-definitions";
import { ReadTFileArgs } from "../file-format-definitions";
import { logParseError } from "../common/parse-utils";

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

export function updatePotTranslations(
  potFile: GetTextTranslations,
  tSet: TSet
) {
  traversePot(potFile, (getText) => {
    const key: string = getText.msgid;
    const value = tSet.get(key);
    if (value !== undefined) {
      getText.msgstr = [value ?? ""];
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

function traversePot(
  potFile: GetTextTranslations,
  operation: (getText: GetTextTranslation) => void
) {
  for (const outerKey of Object.keys(potFile.translations)) {
    const potEntry: { [msgId: string]: GetTextTranslation } =
      potFile.translations[outerKey];
    for (const innerKey of Object.keys(potEntry)) {
      const getText: GetTextTranslation = potEntry[innerKey];
      operation(getText);
    }
  }
}
