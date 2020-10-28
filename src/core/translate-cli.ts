import { translateCore } from "./translate-core";
import { existsSync } from "fs";
import { CliArgs, CoreArgs, TSet } from "./core-definitions";
import { areEqual } from "./tset-ops";
import { checkDir, getDebugPath, logFatal } from "../util/util";
import { missingTCacheTarget, resolveTCache, writeTCache } from "./cache-layer";
import { readTFileCore, writeTFileCore } from "./core-util";
import path from "path";
import {
  getTFileFormatList,
  TFileType,
} from "../file-formats/file-format-definitions";
import { getTServiceList, TServiceType } from "../services/service-definitions";
import { getTMatcherList, TMatcherType } from "../matchers/matcher-definitions";

async function resolveOldTarget(
  args: CliArgs,
  targetFileFormat: TFileType
): Promise<TSet | null> {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir);
  if (existsSync(targetPath)) {
    return await readTFileCore(targetFileFormat, {
      path: args.targetFile,
      lng: args.targetLng,
      format: targetFileFormat,
      keySearch: "x",
      keyReplace: "x", // Key-replacement is only done after reading a source-file
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
  const fileFormats = getTFileFormatList();
  const services = getTServiceList();
  const matchers = getTMatcherList();
  if (!services.includes(cliArgs.service as TServiceType)) {
    logFatal(
      `Unknown service "${
        cliArgs.service
      }". Available services: ${formatCliOptions(services)}`
    );
  }
  if (!matchers.includes(cliArgs.matcher as TMatcherType)) {
    logFatal(
      `Unknown matcher "${
        cliArgs.matcher
      }". Available matchers: ${formatCliOptions(matchers)}`
    );
  }
  if (!fileFormats.includes(cliArgs.srcFormat as TFileType)) {
    logFatal(
      `Unknown source format "${
        cliArgs.srcFormat
      }". Available formats: ${formatCliOptions(fileFormats)}`
    );
  }
  const srcFileFormat: TFileType = cliArgs.srcFormat as TFileType;
  if (!fileFormats.includes(cliArgs.targetFormat as TFileType)) {
    logFatal(
      `Unknown target format "${
        cliArgs.targetFormat
      }". Available formats: ${formatCliOptions(fileFormats)}`
    );
  }
  const targetFileFormat = cliArgs.targetFormat as TFileType;
  const src = await readTFileCore(srcFileFormat, {
    path: cliArgs.srcFile,
    lng: cliArgs.srcLng,
    format: srcFileFormat,
    keySearch: cliArgs.keySearch,
    keyReplace: cliArgs.keyReplace,
  });
  if (!src.size) {
    logFatal(
      `${getDebugPath(
        cliArgs.srcFile
      )} does not contain any translatable content`
    );
  }

  const srcCache: TSet | null = resolveTCache(src, cliArgs);
  const oldTarget: TSet | null = await resolveOldTarget(
    cliArgs,
    targetFileFormat
  );

  const manualReview = parseBooleanOption(cliArgs.manualReview, "manualReview");
  const coreArgs: CoreArgs = {
    src,
    srcCache,
    srcLng: cliArgs.srcLng,
    oldTarget,
    targetLng: cliArgs.targetLng,
    service: cliArgs.service as TServiceType,
    serviceConfig: cliArgs.serviceConfig ?? null,
    matcher: cliArgs.matcher as TMatcherType,
    deleteStale: parseBooleanOption(cliArgs.deleteStale, "deleteStale"),
  };
  const result = await translateCore(coreArgs);

  const flushTarget: boolean =
    !oldTarget || !areEqual(oldTarget, result.newTarget);
  if (flushTarget) {
    console.info(`Write target ${getDebugPath(cliArgs.targetFile)}`);
    await writeTFileCore(targetFileFormat, {
      path: cliArgs.targetFile,
      tSet: result.newTarget,
      lng: cliArgs.targetLng,
      changeSet: result.changeSet,
      manualReview,
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
  if (!flushTarget && srcCache) {
    console.info(`Target is up-to-date: '${cliArgs.targetFile}'`);
  }
}

function parseBooleanOption(rawOption: string, optionKey: string): boolean {
  const option = rawOption.trim().toLowerCase();
  if (option === "true") {
    return true;
  } else if (option === "false") {
    return false;
  } else {
    logFatal(
      `Invalid option '--${optionKey}=${rawOption}'. Should be either true or false.`
    );
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
