import * as path from "path";
import { translateCore } from "./translate-core";
import { existsSync } from "fs";
import { CliArgs, CoreArgs, TSet } from "./core-definitions";
import { areEqual, leftMinusRightFillNull } from "./tset-ops";
import { checkDir, getDebugPath, logFatal } from "../util/util";
import { serviceMap } from "../services/service-definitions";
import { matcherMap } from "../matchers/matcher-definitions";
import {
  fileFormatMap,
  TFileFormat,
} from "../file-formats/file-format-definitions";

function resolveCachePath(args: CliArgs): string {
  const cacheDir = args.cacheDir;
  checkDir(cacheDir);
  const baseName = path.basename(args.srcFile);
  const cacheName = `attranslate-cache-${args.srcLng}_${baseName}.json`;
  return path.resolve(cacheDir, cacheName);
}

function resolveOldTarget(
  args: CliArgs,
  targetFileFormat: TFileFormat
): TSet | null {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir);
  if (existsSync(targetPath)) {
    return targetFileFormat.readTFile(targetPath, args.targetLng);
  } else {
    return null;
  }
}

export function formatCliOptions(options: string[]): string {
  return `${options.map((o) => `"${o}"`).join(", ")}`;
}

export async function translateCli(cliArgs: CliArgs) {
  if (!(cliArgs.service in serviceMap)) {
    logFatal(
      `Unknown service "${
        cliArgs.service
      }". Available services: ${formatCliOptions(Object.keys(serviceMap))}`
    );
  }
  if (!(cliArgs.matcher in matcherMap)) {
    logFatal(
      `Unknown matcher "${
        cliArgs.matcher
      }". Available matchers: ${formatCliOptions(Object.keys(matcherMap))}`
    );
  }
  if (!(cliArgs.srcFormat in fileFormatMap)) {
    logFatal(
      `Unknown source format "${
        cliArgs.srcFormat
      }". Available formats: ${formatCliOptions(Object.keys(fileFormatMap))}`
    );
  }
  const srcFileFormat =
    fileFormatMap[cliArgs.srcFormat as keyof typeof fileFormatMap];
  if (!(cliArgs.targetFormat in fileFormatMap)) {
    logFatal(
      `Unknown target format "${
        cliArgs.targetFormat
      }". Available formats: ${formatCliOptions(Object.keys(fileFormatMap))}`
    );
  }
  const targetFileFormat =
    fileFormatMap[cliArgs.targetFormat as keyof typeof fileFormatMap];
  const cacheFileFormat = fileFormatMap["flat-json"];
  const src = srcFileFormat.readTFile(cliArgs.srcFile, cliArgs.srcLng);
  if (!src.size) {
    logFatal(
      `${getDebugPath(
        cliArgs.srcFile
      )} does not contain any translatable content`
    );
  }

  const cachePath = resolveCachePath(cliArgs);
  let srcCache: TSet | null = null;
  if (existsSync(cachePath)) {
    srcCache = cacheFileFormat.readTFile(cachePath, cliArgs.srcLng);
  }

  const oldTarget: TSet | null = resolveOldTarget(cliArgs, targetFileFormat);

  const coreArgs: CoreArgs = {
    src,
    srcCache,
    srcLng: cliArgs.srcLng,
    oldTarget,
    targetLng: cliArgs.targetLng,
    service: cliArgs.service as keyof typeof serviceMap,
    serviceConfig: cliArgs.serviceConfig,
    matcher: cliArgs.matcher as keyof typeof matcherMap,
  };
  const result = await translateCore(coreArgs);
  if (!areEqual(result.newTarget, oldTarget)) {
    const countAdded: number = result.changeSet.added?.size ?? 0;
    if (countAdded) {
      console.info(`Add ${countAdded} new translations`);
    }
    const countUpdated: number = result.changeSet.updated?.size ?? 0;
    if (countUpdated) {
      console.info(`Update ${countUpdated} existing translations`);
    }
    console.info(`Write target-file ${getDebugPath(cliArgs.targetFile)}`);
    targetFileFormat.writeTFile(cliArgs.targetFile, result.newTarget);
  }
  let newSrcCache: TSet;
  if (result.changeSet.skipped?.size) {
    // TODO: Cleanup, maybe move logic to core
    console.warn(
      `Warning: Skipped ${result.changeSet.skipped.size} translations`
    );
    newSrcCache = leftMinusRightFillNull(src, result.changeSet.skipped);
  } else {
    newSrcCache = src;
  }
  if (!srcCache || !areEqual(srcCache, newSrcCache)) {
    console.info(`Write cache ${getDebugPath(cachePath)}`);
    cacheFileFormat.writeTFile(cachePath, newSrcCache);
  }
}
