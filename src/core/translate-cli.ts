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
import { getTMatcherList, TMatcherType } from "../matchers/matcher-definitions";

async function resolveOldTarget(
  args: CliArgs,
  targetFileFormat: TFileType
): Promise<TSet | null> {
  const targetPath = path.resolve(args.targetFile);
  const targetDir = path.dirname(targetPath);
  checkDir(targetDir, { errorHint: "Target path" });
  if (existsSync(targetPath)) {
    return await readTFileCore(targetFileFormat, {
      path: args.targetFile,
      lng: args.targetLng,
      format: targetFileFormat,
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
  resolveFormatOptions(cliArgs);
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

  checkNotDir(cliArgs.srcFile, { errorHint: "srcFile" });
  const src = await readTFileCore(srcFileFormat, {
    path: cliArgs.srcFile,
    lng: cliArgs.srcLng,
    format: srcFileFormat,
  });
  if (!src.size) {
    logFatal(
      `${getDebugPath(
        cliArgs.srcFile
      )} does not contain any translatable content`
    );
  }

  const oldTarget: TSet | null = await resolveOldTarget(
    cliArgs,
    targetFileFormat
  );

  const coreArgs: CoreArgs = {
    src,
    srcLng: cliArgs.srcLng,
    oldTarget,
    targetLng: cliArgs.targetLng,
    service: cliArgs.service as TServiceType,
    serviceConfig: cliArgs.serviceConfig ?? null,
    matcher: cliArgs.matcher as TMatcherType,
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
      format: targetFileFormat,
    });
  }
  if (!flushTarget) {
    console.info(`Target is up-to-date: '${cliArgs.targetFile}'`);
  }
}

function resolveFormatOptions(cliArgs: CliArgs): void {
  const legacyUsed =
    cliArgs.srcFormat !== undefined || cliArgs.targetFormat !== undefined;

  // Legacy mode: explicit source/target formats.
  // This is the only supported way to do format conversion.
  if (legacyUsed) {
    if (!cliArgs.srcFormat) {
      logFatal(
        "required option '--srcFormat <sourceFileFormat>' not specified"
      );
    }
    if (!cliArgs.targetFormat) {
      logFatal(
        "required option '--targetFormat <targetFileFormat>' not specified"
      );
    }
    return;
  }

  // New mode: one format for both source and target.
  if (!cliArgs.format) {
    logFatal("required option '--format <format>' not specified");
  }

  const raw = cliArgs.format;
  const spec = raw.trim();
  // Empty-string is handled by checkForEmptyStringOptions(), but be defensive.
  if (!spec.length) {
    logFatal("required option '--format <format>' not specified");
  }
  cliArgs.srcFormat = spec;
  cliArgs.targetFormat = spec;
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
