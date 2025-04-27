import commander from "commander";
import "dotenv/config";
import { CliArgs } from "./core/core-definitions";
import { formatCliOptions, translateCli } from "./core/translate-cli";
import { getTFileFormatList } from "./file-formats/file-format-definitions";
import { getTMatcherList } from "./matchers/matcher-definitions";
import { getTServiceList } from "./services/service-definitions";
import { extractVersion } from "./util/extract-version";

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
      "--matcher <matcher>",
      formatOneOfOptions(getTMatcherList()),
      "none"
    )
    .option(
      "--prompt <prompt>",
      "supply a prompt for the AI translation service"
    )
    .version(extractVersion({ cliBinDir }), "-v, --version")
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
    matcher: commander.opts().matcher,
    prompt: commander.opts().prompt,
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
