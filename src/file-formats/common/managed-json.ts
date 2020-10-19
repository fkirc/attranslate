import { FormatCache } from "./format-cache";
import {
  getDebugPath,
  logFatal,
  readUtf8File,
  writeUf8File,
} from "../../util/util";
import { EOL } from "os";

interface ManagedJson {
  jsonSuffix: string | null;
}

/**
 * Divergent JSON-line-endings can be painful in IDEs like WebStorm.
 * Therefore, we remember line-endings that were previously present.
 */
const jsonCache = new FormatCache<unknown, ManagedJson>();

const checkedEndings: string[] = ["\n", "\r\n", EOL];

export function writeManagedJson(args: {
  path: string;
  object: unknown;
}): string {
  const rawJsonString = JSON.stringify(args.object, null, 2);
  const jsonSuffix: string | null =
    jsonCache.lookupAuxdata({ path: args.path })?.jsonSuffix ?? null;
  const jsonString = jsonSuffix
    ? `${rawJsonString}${jsonSuffix}`
    : rawJsonString;
  writeUf8File(args.path, jsonString);
  return jsonString;
}

export function readManagedJson<T>(path: string): Partial<T> {
  const { object, jsonString } = readRawJson<T>(path);
  let jsonSuffix: string | null = null;
  for (const ending of checkedEndings) {
    if (jsonString.endsWith(ending)) {
      jsonSuffix = ending;
    }
  }
  jsonCache.insertFileCache({
    path,
    entries: new Map(),
    auxData: { jsonSuffix },
  });
  return object;
}

export function readRawJson<T>(
  path: string
): { object: Partial<T>; jsonString: string } {
  try {
    const jsonString = readUtf8File(path);
    return { object: JSON.parse(jsonString) as Partial<T>, jsonString };
  } catch (e) {
    console.error(e);
    logFatal(`Failed to parse ${getDebugPath(path)}.`);
  }
}
