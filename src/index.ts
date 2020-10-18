import commander from "commander";
import { translateCli, formatCliOptions } from "./core/translate-cli";
import { getTFileFormatList } from "./file-formats/file-format-definitions";
import { CliArgs } from "./core/core-definitions";
import { getTServiceList } from "./services/service-definitions";
import { getTMatcherList } from "./matchers/matcher-definitions";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

function formatOneOfOptions(options: string[]): string {
  return `One of ${formatCliOptions(options)}`;
}

export function run(process: NodeJS.Process, cliBinDir: string): void {
  commander.addHelpCommand(false);
  commander
    .requiredOption(
      "--srcFile <sourceFile>",
      "The source file to be translated"
    )
    .requiredOption(
      "--srcLng <sourceLanguage>",
      "A language code for the source language"
    )
    .requiredOption(
      "--srcFormat <sourceFileFormat>",
      formatOneOfOptions(getTFileFormatList())
    )
    .requiredOption(
      "--targetFile <targetFile>",
      "The target file for the translations"
    )
    .requiredOption(
      "--targetLng <targetLanguage>",
      "A language code for the target language"
    )
    .requiredOption(
      "--targetFormat <targetFileFormat>",
      formatOneOfOptions(getTFileFormatList())
    )
    .requiredOption(
      "--service <translationService>",
      formatOneOfOptions(getTServiceList())
    )
    .option(
      "--serviceConfig <serviceKey>",
      "supply configuration for a translation service (either a path to a key-file or an API-key)"
    )
    .option(
      "--cacheDir <cacheDir>",
      "The directory where a translation-cache is expected to be found",
      "."
    )
    .option(
      "--matcher <matcher>",
      formatOneOfOptions(getTMatcherList()),
      "none"
    )
    .option(
      "--deleteStale <true | false>",
      "If true, delete translations that exist in the target file but not in the source file",
      "true"
    )
    .option(
      "--manualReview <true | false>",
      "If true, mark newly generated texts with a review-notice",
      "false"
    )
    .parse(process.argv);

  if (commander.args?.length) {
    // Args are not permitted, only work with options.
    commander.unknownCommand();
  }

  const args: CliArgs = {
    srcFile: commander.srcFile,
    srcLng: commander.srcLng,
    srcFormat: commander.srcFormat,
    targetFile: commander.targetFile,
    targetLng: commander.targetLng,
    targetFormat: commander.targetFormat,
    service: commander.service,
    serviceConfig: commander.serviceConfig,
    cacheDir: commander.cacheDir,
    matcher: commander.matcher,
    deleteStale: commander.deleteStale,
    manualReview: commander.manualReview,
  };
  translateCli(args)
    .then(() => {
      process.exit(0);
    })
    .catch((e: Error) => {
      console.error("An error occurred:");
      console.error(e.message);
      console.error(e.stack);
      process.exit(1);
    });
}
