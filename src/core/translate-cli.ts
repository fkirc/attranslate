import { translateCore } from "./translate-core";
import { existsSync } from "fs";
import { CliArgs, CoreArgs, TSet } from "./core-definitions";
import { areEqual } from "./tset-ops";
import { checkDir, checkNotDir, getDebugPath, logFatal } from "../util/util";
import { readTFileCore, writeTFileCore } from "./core-util";
import path from "path";
import {
  getTFileFormatList,
  TFileType,
} from "../file-formats/file-format-definitions";
import { getTServiceList, TServiceType } from "../services/service-definitions";

async function resolveOldTarget(
  args: CliArgs,
  fileFormat: TFileType
): Promise<TSet | null> {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir, { errorHint: "Target path" });
  if (existsSync(targetPath)) {
    return await readTFileCore(fileFormat, {
      path: args.targetFile,
      lng: args.targetLng,
      format: fileFormat,
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
  if (!services.includes(cliArgs.service as TServiceType)) {
    logFatal(
      `Unknown service "${
        cliArgs.service
      }". Available services: ${formatCliOptions(services)}`
    );
  }
  if (!fileFormats.includes(cliArgs.format as TFileType)) {
    logFatal(
      `Unknown format "${
        cliArgs.format
      }". Available formats: ${formatCliOptions(fileFormats)}`
    );
  }
  const fileFormat: TFileType = cliArgs.format as TFileType;

  checkNotDir(cliArgs.srcFile, { errorHint: "srcFile" });
  const src = await readTFileCore(fileFormat, {
    path: cliArgs.srcFile,
    lng: cliArgs.srcLng,
    format: fileFormat,
  });
  if (!src.size) {
    logFatal(
      `${getDebugPath(
        cliArgs.srcFile
      )} does not contain any translatable content`
    );
  }

  const oldTarget: TSet | null = await resolveOldTarget(cliArgs, fileFormat);

  const coreArgs: CoreArgs = {
    src,
    srcLng: cliArgs.srcLng,
    oldTarget,
    targetLng: cliArgs.targetLng,
    service: cliArgs.service as TServiceType,
  };
  const result = await translateCore(coreArgs);

  const flushTarget: boolean =
    !oldTarget || !areEqual(oldTarget, result.newTarget);
  if (flushTarget) {
    console.info(`Write target ${getDebugPath(cliArgs.targetFile)}`);
    await writeTFileCore({
      path: cliArgs.targetFile,
      tSet: result.newTarget,
      lng: cliArgs.targetLng,
      changeSet: result.changeSet,
      format: fileFormat,
    });
  }
  if (!flushTarget) {
    console.info(`Target is up-to-date: '${cliArgs.targetFile}'`);
  }
}

// function parseBooleanOption(rawOption: string, optionKey: string): boolean {
//   const option = rawOption.trim().toLowerCase();
//   if (option === "true") {
//     return true;
//   } else if (option === "false") {
//     return false;
//   } else {
//     logFatal(
//       `Invalid option '--${optionKey}=${rawOption}'. Should be either true or false.`
//     );
//   }
// }

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
