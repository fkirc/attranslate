import {
  GetTextComment,
  GetTextTranslation,
  GetTextTranslations,
  po,
} from "gettext-parser";
import { TSet } from "../../core/core-definitions";
import { ReadTFileArgs, WriteTFileArgs } from "../file-format-definitions";
import { logParseError } from "../common/parse-utils";
import { potCache } from "./po-files";

function mergePotComments(args: {
  source: GetTextComment | null;
  oldTarget: GetTextComment;
}): GetTextComment {
  if (!args.source) {
    return args.oldTarget;
  }
  const source = (args.source as unknown) as Record<string, string>;
  const oldTarget = (args.oldTarget as unknown) as Record<string, string>;
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (!oldTarget[key]) {
      oldTarget[key] = sourceValue;
    }
  }
  return args.oldTarget;
}

export function extractPotTranslations(
  args: ReadTFileArgs,
  potFile: GetTextTranslations
): TSet {
  const tSet: TSet = new Map();
  traversePot(potFile, (getText) => {
    const key: string = getText.msgid;
    const value: string = getText.msgstr.join();
    if (key) {
      tSet.set(key, value);
    }
    const comments = getText.comments;
    if (typeof key === "string" && comments) {
      potCache.insert({ path: args.path, key, entry: { comments } });
    }
  });
  return tSet;
}

export function updatePotTranslations(
  args: WriteTFileArgs,
  potFile: GetTextTranslations
) {
  const oldTarget = potCache.lookupSameFileAuxdata({ path: args.path });
  if (oldTarget) {
    potFile.headers = oldTarget.potFile.headers;
  }
  traversePot(potFile, (getText) => {
    const key: string = getText.msgid;
    const value = args.tSet.get(key);
    if (value !== undefined) {
      getText.msgstr = [value ?? ""];
    }
    const oldTargetComments = potCache.lookup({ path: args.path, key })
      ?.comments;
    if (typeof key === "string" && oldTargetComments) {
      getText.comments = mergePotComments({
        source: getText.comments ?? null,
        oldTarget: oldTargetComments,
      });
    }
  });
}

export function parsePotFile(
  args: ReadTFileArgs,
  rawFile: string
): GetTextTranslations {
  try {
    const potFile = po.parse(rawFile);
    if (!potFile.headers) {
      potFile.headers = new Object;
    }
    potFile.headers["X-Generator"] = "attranslate";
    return potFile;
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
