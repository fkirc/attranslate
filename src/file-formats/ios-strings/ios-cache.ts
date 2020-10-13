import { WriteTFileArgs } from "../file-format-definitions";
import { iOSFile, LineChunk } from "./ios-strings";

const cacheArray: iOSFile[] = [];

function findFileByPath(path: string): iOSFile | null {
  return cacheArray.find((file) => file.path === path) ?? null;
}

export function insertIntoiOSCache(file: iOSFile) {
  cacheArray.push(file);
}

function findChunkInFile(key: string, file: iOSFile): LineChunk | null {
  return file.chunks.get(key) ?? null;
}

const DEFAULT_APPENDIX: string[] = ["\n"];

export function lookupAppendix(): string[] {
  if (cacheArray.length) {
    return cacheArray[cacheArray.length - 1].appendix;
  } else {
    return DEFAULT_APPENDIX;
  }
}

export function lookupLineChunk(
  key: string,
  args: WriteTFileArgs
): LineChunk | null {
  const sameFileCache = findFileByPath(args.path);
  if (sameFileCache) {
    const sameFileHit = findChunkInFile(key, sameFileCache);
    if (sameFileHit) {
      return sameFileHit;
    }
  }
  for (let idx = cacheArray.length - 1; idx >= 0; idx--) {
    const olderCache = cacheArray[idx];
    const hit = findChunkInFile(key, olderCache);
    if (hit) {
      return hit;
    }
  }
  return null;
}
