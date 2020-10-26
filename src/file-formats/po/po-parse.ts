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
): { getTextFile: GetTextTranslations; tSet: TSet } {
  const getTextFile = parseRawGetText(context);
  const tSet = extractTranslations(getTextFile);
  return { getTextFile, tSet };
}

function extractTranslations(getTextFile: GetTextTranslations): TSet {
  const tSet = new Map();
  for (const key of Object.keys(getTextFile.translations)) {
    const getTextEntry: { [msgId: string]: GetTextTranslation } =
      getTextFile.translations[key];
    for (const innerKey of Object.keys(getTextEntry)) {
      const getTextT: GetTextTranslation = getTextEntry[innerKey];
      const key: string = getTextT.msgid;
      const value: string = getTextT.msgstr.join();
      tSet.set(key, value);
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
