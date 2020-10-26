import { GetTextTranslation, GetTextTranslations, po } from "gettext-parser";
import { TSet } from "../../core/core-definitions";
import { ReadTFileArgs } from "../file-format-definitions";
import { logParseError } from "../common/parse-utils";

export interface PoParseContext {
  args: ReadTFileArgs;
  raw: string;
}

export function poParse(
  context: PoParseContext
): { potFile: GetTextTranslations; tSet: TSet } {
  const potFile = parseRawGetText(context);
  const tSet = extractTranslations(potFile);
  return { potFile, tSet };
}

function extractTranslations(potFile: GetTextTranslations): TSet {
  const tSet = new Map();
  for (const outerKey of Object.keys(potFile.translations)) {
    const potEntry: { [msgId: string]: GetTextTranslation } =
      potFile.translations[outerKey];
    for (const innerKey of Object.keys(potEntry)) {
      const getText: GetTextTranslation = potEntry[innerKey];
      const key: string = getText.msgid;
      const value: string = getText.msgstr.join();
      if (key) {
        tSet.set(key, value);
      }
    }
  }
  return tSet;
}

function parseRawGetText(context: PoParseContext): GetTextTranslations {
  try {
    return po.parse(context.raw);
  } catch (e) {
    console.error(e);
    logParseError("GetText parsing error", context.args);
  }
}
