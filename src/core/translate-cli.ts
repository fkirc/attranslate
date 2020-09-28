import * as path from "path";
import { CoreArgs, translateCore } from "./translate-core";
import { readTFile, writeTFile } from "../serializers/nested-json";
import { existsSync } from "fs";
import { TSet } from "./core-definitions";
import { areEqual } from "./tset-ops";
import { checkDir, getDebugPath } from "../util/util";

export interface CliArgs {
  srcFile: string;
  srcLng: string;
  targetFile: string;
  targetLng: string;
  serviceConfig: string;
  cacheDir: string;
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

export async function translateCli(args: CliArgs) {
  const src = readTFile(args.srcFile, args.srcLng);

  const cachePath = resolveCachePath(args);
  let srcCache: TSet | null = null;
  if (existsSync(cachePath)) {
    srcCache = readTFile(cachePath, args.srcLng);
  }

  const oldTarget: TSet | null = resolveOldTarget(args);

  const coreArgs: CoreArgs = {
    src,
    srcCache,
    oldTarget,
    targetLng: args.targetLng,
    service: "google-translate", // TODO: config
    serviceConfig: "gcloud/gcloud_service_account.json", // TODO: config
    matcher: "icu", // TODO: Config,
  };
  const result = await translateCore(coreArgs);
  if (!areEqual(result.newTarget, oldTarget)) {
    const countAdded: number = result.added?.size ?? 0;
    const countUpdated: number = result.updated?.size ?? 0;
    console.info(`Add ${countAdded} new translations`);
    console.info(`Update ${countUpdated} existing translations`);
    console.info(`Write target-file ${getDebugPath(args.targetFile)}`);
    writeTFile(args.targetFile, result.newTarget);
  }
  if (!areEqual(src, srcCache)) {
    console.info(`Write cache ${getDebugPath(cachePath)}`);
    writeTFile(cachePath, src);
  }
}
