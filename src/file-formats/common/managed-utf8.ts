import { FormatCache } from "./format-cache";
import { readUtf8File, writeUf8File } from "../../util/util";
import { EOL } from "os";

interface ManagedUtf8 {
  endings: string | null;
}

/**
 * Divergent line-endings can be painful in IDEs like WebStorm.
 * Therefore, we remember line-endings that were previously present.
 */
const utf8Cache = new FormatCache<unknown, ManagedUtf8>();

const possibleEndings = ["\n", "\r", EOL];

export function writeManagedUtf8(args: { path: string; utf8: string }): string {
  const endings: string | null =
    utf8Cache.lookupAuxdata({ path: args.path })?.endings ?? null;
  const expandedContent = endings
    ? replaceLineEndings({ str: args.utf8, endings })
    : args.utf8;
  writeUf8File(args.path, expandedContent);
  return expandedContent;
}

export function insertUtf8Cache(args: { path: string; utf8: string }) {
  const endings = extractLineEndings(args.utf8);
  utf8Cache.insertFileCache({
    path: args.path,
    entries: new Map(),
    auxData: { endings },
  });
}

export function readManagedUtf8(path: string): string {
  const utf8 = readUtf8File(path);
  insertUtf8Cache({ path, utf8 });
  return utf8;
}

function replaceLineEndings(args: { str: string; endings: string }): string {
  const beginOfEnd = beginOfEndIndex(args.str);
  if (beginOfEnd === null) {
    return `${args.str}${args.endings}`;
  }
  const shorterStr = args.str.slice(beginOfEnd);
  return `${shorterStr}${args.endings}`;
}

function extractLineEndings(str: string): string {
  const beginOfEnd = beginOfEndIndex(str);
  if (beginOfEnd !== null) {
    return str.slice(beginOfEnd);
  } else {
    return "";
  }
}

function beginOfEndIndex(str: string): number | null {
  if (!str.length) {
    return null;
  }
  let beginOfEnd: number | null = null;
  for (let idx = str.length - 1; idx >= 0; idx--) {
    if (possibleEndings.includes(str[idx])) {
      beginOfEnd = idx;
    } else {
      break;
    }
  }
  return beginOfEnd;
}
