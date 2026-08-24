import commander from "commander";
import "dotenv/config";
import { CliArgs } from "./core/core-definitions";
import { formatCliOptions, translateCli } from "./core/translate-cli";
import { getTFileFormatList } from "./file-formats/file-format-definitions";
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
      "The source language"
    )
    .requiredOption(
      "--targetFile <targetFile>",
      "The target file for the translations"
    )
    .requiredOption(
      "--targetLng <targetLanguage>",
      "The target language"
    )
    .requiredOption(
      "--format <format>",
      formatOneOfOptions(getTFileFormatList())
    )
    .requiredOption(
      "--service <translationService>",
      formatOneOfOptions(getTServiceList())
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
    format: commander.opts().format,
    targetFile: commander.opts().targetFile,
    targetLng: commander.opts().targetLng,
    service: commander.opts().service,
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
