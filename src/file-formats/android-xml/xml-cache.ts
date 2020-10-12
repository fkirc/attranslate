import { WriteTFileArgs } from "../file-format-definitions";
import { DEFAULT_ANDROID_XML_INDENT, StringResource } from "./android-xml";

export interface XmlCache {
  path: string;
  detectedIndent: number;
  resources: Map<string, Partial<StringResource>>;
}

const cacheArray: XmlCache[] = [];

function findCacheByPath(path: string): XmlCache | null {
  return cacheArray.find((xmlCache) => xmlCache.path === path) ?? null;
}

export function insertNewXmlCache(xmlCache: XmlCache) {
  cacheArray.push(xmlCache);
}

export function lookupIndent(args: WriteTFileArgs): number {
  const sameFileCache = findCacheByPath(args.path);
  if (sameFileCache) {
    return sameFileCache.detectedIndent;
  }
  if (cacheArray.length) {
    return cacheArray[cacheArray.length - 1].detectedIndent;
  }
  return DEFAULT_ANDROID_XML_INDENT;
}

function lookupIndividualCache(
  key: string,
  cache: XmlCache
): Partial<StringResource> | null {
  return cache.resources.get(key) ?? null;
}

export function lookupStringResource(
  key: string,
  args: WriteTFileArgs
): Partial<StringResource> | null {
  const sameFileCache = findCacheByPath(args.path);
  if (sameFileCache) {
    const sameFileHit = lookupIndividualCache(key, sameFileCache);
    if (sameFileHit) {
      return sameFileHit;
    }
  }
  for (let idx = cacheArray.length - 1; idx >= 0; idx--) {
    const olderCache = cacheArray[idx];
    const hit = lookupIndividualCache(key, olderCache);
    if (hit) {
      return hit;
    }
  }
  return null;
}
