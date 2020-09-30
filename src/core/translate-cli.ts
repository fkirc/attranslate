import * as path from "path";
import { CoreArgs, translateCore } from "./translate-core";
import { readTFile, writeTFile } from "../file-formats/nested-json";
import { existsSync } from "fs";
import { TSet } from "./core-definitions";
import { areEqual } from "./tset-ops";
import { checkDir, getDebugPath, logFatal } from "../util/util";
import { serviceMap } from "../services/service-definitions";
import { matcherMap } from "../matchers/matcher-definitions";

export interface CliArgs {
  srcFile: string;
  srcLng: string;
  targetFile: string;
  targetLng: string;
  service: string;
  serviceConfig: string;
  cacheDir: string;
  matcher: string;
}

function resolveCachePath(args: CliArgs): string {
  const cacheDir = args.cacheDir;
  checkDir(cacheDir);
  const baseName = path.basename(args.srcFile);
  const cacheName = `attranslate-cache-${args.srcLng}_${baseName}.json`;
  return path.resolve(cacheDir, cacheName);
}

function resolveOldTarget(args: CliArgs): TSet | null {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir);
  if (existsSync(targetPath)) {
    return readTFile(targetPath, args.targetLng);
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

  const src = readTFile(cliArgs.srcFile, cliArgs.srcLng);

  const cachePath = resolveCachePath(cliArgs);
  let srcCache: TSet | null = null;
  if (existsSync(cachePath)) {
    srcCache = readTFile(cachePath, cliArgs.srcLng);
  }

  const oldTarget: TSet | null = resolveOldTarget(cliArgs);

  const coreArgs: CoreArgs = {
    src,
    srcCache,
    oldTarget,
    targetLng: cliArgs.targetLng,
    service: cliArgs.service as keyof typeof serviceMap,
    serviceConfig: cliArgs.serviceConfig,
    matcher: cliArgs.matcher as keyof typeof matcherMap,
  };
  const result = await translateCore(coreArgs);
  if (!areEqual(result.newTarget, oldTarget)) {
    const countAdded: number = result.added?.size ?? 0;
    const countUpdated: number = result.updated?.size ?? 0;
    console.info(`Add ${countAdded} new translations`);
    console.info(`Update ${countUpdated} existing translations`);
    console.info(`Write target-file ${getDebugPath(cliArgs.targetFile)}`);
    writeTFile(cliArgs.targetFile, result.newTarget);
  }
  if (!areEqual(src, srcCache)) {
    console.info(`Write cache ${getDebugPath(cachePath)}`);
    writeTFile(cachePath, src);
  }
}
