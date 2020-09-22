#!/usr/bin/env node

import commander from "commander";
import { serviceMap } from "./services";
import { matcherMap } from "./matchers";
import { translate } from "./core/translate";

process.on("unhandledRejection", (error) => {
  console.error("[fatal]", error);
});

export function run(process: NodeJS.Process, cliBinDir: string): void {
  commander.addHelpCommand(false);
  commander
    .requiredOption("--src <sourceFile>", "The source file to be translated")
    .requiredOption(
      "--dst <destinationFile>",
      "The destination file for the translations"
    )
    .option(
      "-i, --input <inputDir>",
      "the directory containing language directories",
      "."
    )
    .option(
      "--cache <cacheDir>",
      "set the cache directory",
      ".json-autotranslate-cache"
    )
    .option(
      "-l, --source-language <sourceLang>",
      "specify the source language",
      "en"
    )
    .option(
      "-t, --type <key-based|natural|auto>",
      `specify the file structure type`,
      /^(key-based|natural|auto)$/,
      "auto"
    )
    .option(
      "-s, --service <service>",
      `selects the service to be used for translation`,
      "google-translate"
    )
    .option("--list-services", `outputs a list of available services`)
    .option(
      "-m, --matcher <matcher>",
      `selects the matcher to be used for interpolations`,
      "icu"
    )
    .option("--list-matchers", `outputs a list of available matchers`)
    .option(
      "-c, --config <value>",
      "supply a config parameter (e.g. path to key file) to the translation service"
    )
    .option(
      "-f, --fix-inconsistencies",
      `automatically fixes inconsistent key-value pairs by setting the value to the key`
    )
    .option(
      "-d, --delete-unused-strings",
      `deletes strings in translation files that don't exist in the template`
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

  if (commander.listMatchers) {
    console.log("Available matchers:");
    console.log(Object.keys(matcherMap).join(", "));
    process.exit(0);
  }

  translate(
    commander.input,
    commander.cacheDir,
    commander.sourceLanguage,
    commander.deleteUnusedStrings,
    commander.type,
    commander.fixInconsistencies,
    commander.service,
    commander.matcher,
    commander.config
  ).catch((e: Error) => {
    console.log();
    console.error("An error has occured:");
    console.error(e.message);
    console.error(e.stack);
    console.log();
    process.exit(1);
  });
}
