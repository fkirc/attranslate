import { getDebugPath, logFatal, readJsonFile } from "../util/util";
import { TCache, TCacheEntry, TCacheTarget } from "./cache-layer";

interface CParseContext {
  key?: string;
  cachePath: string;
}

export function parseTCache(context: CParseContext): TCache {
  const rawCache: Partial<TCache> = readJsonFile<TCache>(context.cachePath);
  const { version, entries } = rawCache;
  if (!version) {
    logCacheError(`version is falsy`, context);
  }
  if (version.major !== 1) {
    logCacheError(`Version '${version.major}' is not supported`, context);
  }
  if (!entries) {
    logCacheError(`entries is falsy`, context);
  }
  Object.keys(entries).forEach((key) => {
    const entry = entries[key];
    validateTCacheEntry(entry, { ...context, key });
  });
  return { version, entries };
}

function logCacheError(rawMsg: string, context: CParseContext): never {
  const msg = context.key
    ? `An error occurred in cache-entry ${context.key}: ${rawMsg}`
    : `A cache error occurred: ${rawMsg}`;
  logFatal(
    `${msg}. You may try to delete ${getDebugPath(
      context.cachePath
    )} and then re-run this tool.`
  );
}

function validateTCacheEntry(
  entry: Partial<TCacheEntry>,
  context: CParseContext
): TCacheEntry {
  const { value, targets } = entry;
  if (!value) {
    logCacheError(`value is falsy`, context);
  }
  if (!targets || !Array.isArray(targets) || !targets.length) {
    logCacheError(`targets are invalid`, context);
  }
  targets.forEach((target: Partial<TCacheTarget>) => {
    validateTCacheTarget(target, context);
  });
  return { value, targets };
}

function validateTCacheTarget(
  target: Partial<TCacheTarget>,
  context: CParseContext
): TCacheTarget {
  const { id, state } = target;
  if (!id) {
    logCacheError(`id is falsy`, context);
  }
  if (!state) {
    logCacheError(`state is falsy`, context);
  }
  return { id, state };
}
