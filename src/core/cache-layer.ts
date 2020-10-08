import { fileFormatMap } from "../file-formats/file-format-definitions";
import { CliArgs, CoreResults, TSet } from "./core-definitions";
import { existsSync } from "fs";
import { checkDir } from "../util/util";
import path from "path";

export function resolveCachePath(args: CliArgs): string {
  const cacheDir = args.cacheDir;
  checkDir(cacheDir);
  const baseName = path.basename(args.srcFile);
  const cacheName = `attranslate-cache-${args.srcLng}_${baseName}.json`;
  return path.resolve(cacheDir, cacheName);
}

const cacheFileFormat = fileFormatMap["flat-json"];

export function resolveTCache(args: CliArgs): TSet | null {
  const cachePath = resolveCachePath(args);
  if (!existsSync(cachePath)) {
    return null;
  }
  return cacheFileFormat.readTFile(cachePath, args.srcLng);
}

export function writeTCache(cachePath: string, results: CoreResults) {
  cacheFileFormat.writeTFile(cachePath, results.newSrcCache);
}
