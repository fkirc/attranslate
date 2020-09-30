import commander from "commander";
import { serviceMap } from "./services/service-definitions";
import { matcherMap } from "./matchers/matcher-definitions";
import { translateCli, CliArgs } from "./core/translate-cli";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

function formatOptions(options: string[]): string {
  return `One of ${options.map((o) => `"${o}"`).join(", ")}`;
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
      "--targetFile <targetFile>",
      "The target file for the translations"
    )
    .requiredOption(
      "--targetLng <targetLanguage>",
      "A language code for the target language"
    )
    .requiredOption(
      "--serviceConfig <pathToKeyFile>",
      "supply configuration (e.g. path to key file) for the translation service"
    )
    .option(
      "--cacheDir <srcCacheDir>",
      "The directory where the source-cache is expected to be found",
      "."
    )
    .option("--list-services", `outputs a list of available services`)
    .option(
      "--matcher <matcher>",
      formatOptions(Object.keys(matcherMap)),
      "icu"
    )
    .parse(process.argv);

  if (commander.args?.length) {
    // Args are not permitted, only work with options.
    commander.unknownCommand();
  }
  if (commander.listServices) {
    console.log("Available services:");
    console.log(Object.keys(serviceMap).join(", "));
    process.exit(0);
  }

  const args: CliArgs = {
    srcFile: commander.srcFile,
    srcLng: commander.srcLng,
    targetFile: commander.targetFile,
    targetLng: commander.targetLng,
    serviceConfig: commander.serviceConfig,
    cacheDir: commander.cacheDir,
  };
  translateCli(args)
    .then(() => {
      process.exit(0);
    })
    .catch((e: Error) => {
      console.log();
      console.error("An error occurred:");
      console.error(e.message);
      console.error(e.stack);
      console.log();
      process.exit(1);
    });
}
