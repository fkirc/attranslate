#!/usr/bin/env node

import commander from "commander";
import { serviceMap } from "./services";
import { matcherMap } from "./matchers";
import { translateCli, CliArgs } from "./core/translate-cli";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

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
      "--dstFile <destinationFile>",
      "The destination file for the translations"
    )
    .requiredOption(
      "--dstLng <destinationLanguage>",
      "A language code for the destination language"
    )
    .requiredOption(
      "--serviceConfig <pathToKeyFile>",
      "supply configuration (e.g. path to key file) for the translation service"
    )
    .option("--list-services", `outputs a list of available services`)
    .option(
      "-m, --matcher <matcher>",
      `selects the matcher to be used for interpolations`,
      "icu"
    )
    .option("--list-matchers", `outputs a list of available matchers`)
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

  if (commander.listMatchers) {
    console.log("Available matchers:");
    console.log(Object.keys(matcherMap).join(", "));
    process.exit(0);
  }

  const args: CliArgs = {
    srcFile: commander.srcFile,
    srcLng: commander.srcLng,
    dstFile: commander.dstFile,
    dstLng: commander.dstLng,
    serviceConfig: commander.serviceConfig,
  };
  translateCli(args).catch((e: Error) => {
    console.log();
    console.error("An error has occured:");
    console.error(e.message);
    console.error(e.stack);
    console.log();
    process.exit(1);
  });
}
