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
  commander.storeOptionsAsProperties(false);
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
    .option(
      "--keySearch <regExp>",
      "A regular expression to replace translation-keys (can be used for file-format conversions)",
      "x"
    )
    .option(
      "--keyReplace <string>",
      "The replacement for occurrences of keySearch",
      "x"
    )
    .parse(process.argv);

  if (commander.args?.length) {
    // Args are not permitted, only work with options.
    commander.unknownCommand();
  }

  const args: CliArgs = {
    srcFile: commander.opts().srcFile,
    srcLng: commander.opts().srcLng,
    srcFormat: commander.opts().srcFormat,
    targetFile: commander.opts().targetFile,
    targetLng: commander.opts().targetLng,
    targetFormat: commander.opts().targetFormat,
    service: commander.opts().service,
    serviceConfig: commander.opts().serviceConfig,
    cacheDir: commander.opts().cacheDir,
    matcher: commander.opts().matcher,
    deleteStale: commander.opts().deleteStale,
    manualReview: commander.opts().manualReview,
    keySearch: commander.opts().keySearch,
    keyReplace: commander.opts().keyReplace,
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
