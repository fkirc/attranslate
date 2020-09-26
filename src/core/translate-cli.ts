import { loadTranslations } from "../util/file-system";
import { serviceMap } from "../services";
import { matcherMap } from "../matchers";
import { flatten, unflatten } from "../util/flatten";
import { diff } from "deep-object-diff";
import { omit } from "lodash";
import * as path from "path";
import * as fs from "fs";
import ncp = require("ncp");

export interface CliArgs {
  srcFile: string;
  srcLng: string;
  dstFile: string;
  dstLng: string;
  serviceConfig: string;
}

export async function translateCli(args: CliArgs) {
  console.log("run translate with args", args); // TODO: Remove
  const service: keyof typeof serviceMap = "google-translate"; // TODO: Config
  const matcher: keyof typeof matcherMap = "icu"; // TODO: Config

  const deleteUnusedStrings = false; // TODO: Config or remove.
  const cacheDir = ".json-autotranslate-cache"; // TODO: Config
  const resolvedCacheDir = path.resolve(process.cwd(), cacheDir);

  if (!fs.existsSync(resolvedCacheDir)) {
    fs.mkdirSync(resolvedCacheDir); // TODO: Remove auto-creation of cache dir?
    console.log(`Created the cache directory.`);
  }

  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }

  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }

  const translationService = serviceMap[service];

  const templateFile = loadTranslations(args.srcFile);

  console.log(`✨ Initializing ${translationService.name}...`);
  await translationService.initialize(args.serviceConfig, matcherMap[matcher]);
  console.log(`└── Done`);
  console.log();

  if (!translationService.supportsLanguage(args.srcLng)) {
    throw new Error(
      `${translationService.name} doesn't support the source language ${args.srcLng}`
    );
  }

  //console.log(`🔍 Looking for key-value inconsistencies in source files...`);
  //const insonsistentFiles: string[] = [];

  // TODO: Rewrite or remove
  /*for (const file of templateFiles.filter((f) => f.type === "natural")) {
    const inconsistentKeys = Object.keys(file.content).filter(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (key) => key !== file.content[key]
    );

    if (inconsistentKeys.length > 0) {
      insonsistentFiles.push(file.name);
      console.log(
        `├── ${file.name} contains ${String(
          inconsistentKeys.length
        )} inconsistent key(s)`
      );
    }
  }*/

  /*if (insonsistentFiles.length > 0) {
    console.log(
      `└── {yellow.bold Found key-value inconsistencies in} {red.bold ${String(
        insonsistentFiles.length
      )}} {yellow.bold file(s).}`
    );
    // TODO: Rewrite or remove
    if (fixInconsistencies) {
      console.log(`💚 Fixing inconsistencies...`);
      fixSourceInconsistencies(
        path.resolve(workingDir, sourceLang),
        path.resolve(resolvedCacheDir, sourceLang)
      );
      console.log(`└── {green.bold Fixed all inconsistencies.}`);
    } else {
      console.log(
        `Please either fix these inconsistencies manually or supply the {green.bold -f} flag to automatically fix them.`
      );
    }
  } else {
    console.log(`└── {green.bold No inconsistencies found}`);
  }
  console.log();*/

  // TODO: Rewrite
  /*console.log(`🔍 Looking for invalid keys in source files...`);
  const invalidKeys = Object.keys(templateFile.originalContent).filter(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (k) => typeof file.originalContent[k] === "string" && k.includes(".")
  );
  if (invalidKeys.length > 0) {
    console.log(
      `├── {yellow.bold ${templateFile.name} contains} {red.bold ${String(
        invalidKeys.length
      )}} {yellow.bold invalid key(s)}`
    );
    console.log();
    console.log(
      `It looks like you're trying to use the key-based mode on natural-language-style JSON files.`
    );
    console.log(
      `Please make sure that your keys don't contain periods (.) or remove the {green.bold --type} / {green.bold -t} option.`
    );
    console.log();
    process.exit(1);
  } else {
    console.log(`└── {green.bold No invalid keys found}`);
  }*/

  let addedTranslations = 0;
  let removedTranslations = 0;

  if (!translationService.supportsLanguage(args.dstLng)) {
    console.error(
      `🙈 {yellow.bold ${translationService.name} doesn't support} {red.bold ${args.dstLng}}{yellow.bold.}`
    );
    console.log();
    process.exit(1);
  }

  const existingFile = loadTranslations(path.resolve(args.dstFile)); // TODO: Rewrite

  console.log(
    `💬 Translating strings from {green.bold ${args.srcLng}} to {green.bold ${args.dstLng}}...`
  );

  /*if (deleteUnusedStrings) { // TODO: Reimplement
    const templateFileNames = templateFiles.map((t) => t.name);
    const deletableFiles = existingFiles.filter(
      (f) => !templateFileNames.includes(f.name)
    );

    for (const file of deletableFiles) {
      console.log(
        `├── {red.bold ${file.name} is no longer used and will be deleted.}`
      );

      fs.unlinkSync(path.resolve(workingDir, language, file.name));

      const cacheFile = path.resolve(workingDir, language, file.name);
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    }
  }*/

  process.stdout.write(`├── Translating ${templateFile.name}`);

  const existingKeys = existingFile ? Object.keys(existingFile.content) : [];
  const existingTranslations = existingFile ? existingFile.content : {};

  const cachePath = path.resolve(
    resolvedCacheDir,
    args.srcLng,
    existingFile ? existingFile.name : ""
  );
  let cacheDiff: string[] = [];
  if (fs.existsSync(cachePath) && !fs.statSync(cachePath).isDirectory()) {
    const cachedFile = flatten(
      JSON.parse(fs.readFileSync(cachePath).toString().trim())
    );
    const cDiff = diff(cachedFile, templateFile.content);
    cacheDiff = Object.keys(cDiff).filter((k) => (cDiff as never)[k]);
    const changedItems = Object.keys(cacheDiff).length.toString();
    process.stdout.write(` ({green.bold ${changedItems}} changes from cache)`);
  }

  const templateStrings = Object.keys(templateFile.content);
  const stringsToTranslate = templateStrings
    .filter((key) => !existingKeys.includes(key) || cacheDiff.includes(key))
    .map((key) => ({
      key,
      value:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        templateFile.type === "key-based" ? templateFile.content[key] : key,
    }));

  const unusedStrings = existingKeys.filter(
    (key) => !templateStrings.includes(key)
  );

  const translatedStrings = await translationService.translateStrings(
    stringsToTranslate,
    args.srcLng,
    args.dstLng
  );

  const newKeys = translatedStrings.reduce(
    (acc, cur) => ({ ...acc, [cur.key]: cur.translated }),
    {} as { [k: string]: string }
  );

  addedTranslations += translatedStrings.length;
  removedTranslations += deleteUnusedStrings ? unusedStrings.length : 0;

  if (service !== "dry-run") {
    const translatedFile = {
      ...omit(existingTranslations, deleteUnusedStrings ? unusedStrings : []),
      ...newKeys,
    };

    const newContent =
      JSON.stringify(
        templateFile.type === "key-based"
          ? unflatten(translatedFile)
          : translatedFile,
        null,
        2
      ) + `\n`;

    fs.writeFileSync(path.resolve(args.dstFile), newContent);

    // TODO: Do we need output caches?
    /*const languageCachePath = path.resolve(resolvedCacheDir, dstFile); // TODO: Remove?
    if (!fs.existsSync(languageCachePath)) {
      fs.mkdirSync(languageCachePath);
    }
    fs.writeFileSync(
      path.resolve(languageCachePath, templateFile.name),
      JSON.stringify(translatedFile, null, 2) + "\n"
    );*/
  }

  console.log(
    deleteUnusedStrings && unusedStrings.length > 0
      ? ` ( +${String(translatedStrings.length)}/ -${String(
          unusedStrings.length
        )})`
      : ` ( +${String(translatedStrings.length)})`
  );

  console.log(`└── All strings have been translated.`);
  console.log();

  if (service !== "dry-run") {
    console.log("🗂 Caching source translation files...");
    await new Promise((res, rej) =>
      ncp(
        path.resolve(args.srcFile),
        path.resolve(resolvedCacheDir, "src-file-cache"), // TODO: Change
        (err) => (err ? rej() : res())
      )
    );
    console.log(`└── Translation files have been cached.`);
    console.log();
  }

  console.log(`${addedTranslations} new translations have been added!`);

  if (removedTranslations > 0) {
    console.log(`${removedTranslations} translations have been removed!`);
  }
}
