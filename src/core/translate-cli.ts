import * as path from "path";
import { translateCore } from "./translate-core";
import { existsSync } from "fs";
import { CliArgs, CoreArgs, TSet } from "./core-definitions";
import { areEqual } from "./tset-ops";
import { checkDir, getDebugPath, logFatal } from "../util/util";
import { serviceMap } from "../services/service-definitions";
import { matcherMap } from "../matchers/matcher-definitions";
import { fileFormatMap } from "../file-formats/file-format-definitions";
import { missingTCacheTarget, resolveTCache, writeTCache } from "./cache-layer";
import { readTFileCore, writeTFileCore } from "./core-util";

function resolveOldTarget(
  args: CliArgs,
  targetFileFormat: keyof typeof fileFormatMap
): TSet | null {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir);
  if (existsSync(targetPath)) {
    return readTFileCore(targetFileFormat, {
      path: targetPath,
      lng: args.targetLng,
    });
  } else {
    return null;
  }
}

export function formatCliOptions(options: string[]): string {
  return `${options.map((o) => `"${o}"`).join(", ")}`;
}

export async function translateCli(cliArgs: CliArgs) {
  checkForEmptyStringOptions(cliArgs);
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
  const srcFileFormat: keyof typeof fileFormatMap = cliArgs.srcFormat as keyof typeof fileFormatMap;
  if (!(cliArgs.targetFormat in fileFormatMap)) {
    logFatal(
      `Unknown target format "${
        cliArgs.targetFormat
      }". Available formats: ${formatCliOptions(Object.keys(fileFormatMap))}`
    );
  }
  const targetFileFormat = cliArgs.targetFormat as keyof typeof fileFormatMap;
  const src = readTFileCore(srcFileFormat, {
    path: cliArgs.srcFile,
    lng: cliArgs.srcLng,
  });
  if (!src.size) {
    logFatal(
      `${getDebugPath(
        cliArgs.srcFile
      )} does not contain any translatable content`
    );
  }

  const srcCache: TSet | null = resolveTCache(src, cliArgs);
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
    deleteStale: parseBooleanOption(cliArgs.deleteStale),
  };
  const result = await translateCore(coreArgs);

  const flushTarget: boolean =
    !oldTarget || !areEqual(oldTarget, result.newTarget);
  if (flushTarget) {
    console.info(`Write target ${getDebugPath(cliArgs.targetFile)}`);
    writeTFileCore(targetFileFormat, {
      path: cliArgs.targetFile,
      tSet: result.newTarget,
      lng: cliArgs.targetLng,
    });
  }
  const flushCache =
    flushTarget ||
    missingTCacheTarget() ||
    !srcCache ||
    !areEqual(srcCache, result.newSrcCache);
  if (flushCache) {
    writeTCache(result, cliArgs);
  }
}

function parseBooleanOption(rawOption: string): boolean {
  const option = rawOption.trim().toLowerCase();
  if (option === "true") {
    return true;
  } else if (option === "false") {
    return false;
  } else {
    logFatal(`Invalid option '${rawOption}'. Must be either true or false.`);
  }
}

function checkForEmptyStringOptions(args: CliArgs) {
  Object.keys(args).forEach((key) => {
    const arg: string | undefined = args[key];
    if (typeof arg === "string" && (arg === "" || !arg.trim().length)) {
      logFatal(
        `option '--${key}' is empty -> Either omit it or provide a value`
      );
    }
  });
}
