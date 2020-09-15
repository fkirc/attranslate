import {
  FileType,
  fixSourceInconsistencies,
  getAvailableLanguages,
  loadTranslations,
} from '../util/file-system';
import { serviceMap } from '../services';
import { matcherMap } from '../matchers';
import path from 'path';
import fs from 'fs';
import { flatten, unflatten } from '../util/flatten';
import { diff } from 'deep-object-diff';
import { omit } from 'lodash';
import ncp from 'ncp';

export const translate = async (
  inputDir = '.',
  cacheDir = '.json-autotranslate-cache',
  sourceLang = 'en',
  deleteUnusedStrings = false,
  fileType: FileType = 'auto',
  fixInconsistencies = false,
  service: keyof typeof serviceMap = 'google-translate',
  matcher: keyof typeof matcherMap = 'icu',
  config?: string,
) => {
  const workingDir = path.resolve(process.cwd(), inputDir);
  const resolvedCacheDir = path.resolve(process.cwd(), cacheDir);
  const languageFolders = getAvailableLanguages(workingDir);
  const targetLanguages = languageFolders.filter((f) => f !== sourceLang);

  if (!fs.existsSync(resolvedCacheDir)) {
    fs.mkdirSync(resolvedCacheDir);
    console.log(`Created the cache directory.`);
  }

  if (!languageFolders.includes(sourceLang)) {
    throw new Error(`The source language ${sourceLang} doesn't exist.`);
  }

  if (typeof serviceMap[service] === 'undefined') {
    throw new Error(`The service ${service} doesn't exist.`);
  }

  if (typeof matcherMap[matcher] === 'undefined') {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }

  const translationService = serviceMap[service];

  const templateFiles = loadTranslations(
    path.resolve(workingDir, sourceLang),
    fileType,
  );

  if (templateFiles.length === 0) {
    throw new Error(
      `The source language ${sourceLang} doesn't contain any JSON files.`,
    );
  }

  console.log(`Found ${String(targetLanguages.length)} target language(s):`);
  console.log(`-> ${targetLanguages.join(', ')}`);
  console.log();

  console.log(`🏭 Loading source files...`);
  for (const file of templateFiles) {
    console.log(`├── ${String(file.name)} (${file.type})`);
  }
  console.log(`└── Done`);
  console.log();

  console.log(`✨ Initializing ${translationService.name}...`);
  await translationService.initialize(config, matcherMap[matcher]);
  console.log(`└── Done`);
  console.log();

  if (!translationService.supportsLanguage(sourceLang)) {
    throw new Error(
      `${translationService.name} doesn't support the source language ${sourceLang}`,
    );
  }

  console.log(`🔍 Looking for key-value inconsistencies in source files...`);
  const insonsistentFiles: string[] = [];

  for (const file of templateFiles.filter((f) => f.type === 'natural')) {
    const inconsistentKeys = Object.keys(file.content).filter(
      (key) => key !== file.content[key],
    );

    if (inconsistentKeys.length > 0) {
      insonsistentFiles.push(file.name);
      console.log(
        `├── ${file.name} contains ${String(
          inconsistentKeys.length,
        )} inconsistent key(s)`,
      );
    }
  }

  if (insonsistentFiles.length > 0) {
    console.log(
      `└── {yellow.bold Found key-value inconsistencies in} {red.bold ${String(
        insonsistentFiles.length,
      )}} {yellow.bold file(s).}`,
    );

    console.log();

    if (fixInconsistencies) {
      console.log(`💚 Fixing inconsistencies...`);
      fixSourceInconsistencies(
        path.resolve(workingDir, sourceLang),
        path.resolve(resolvedCacheDir, sourceLang),
      );
      console.log(`└── {green.bold Fixed all inconsistencies.}`);
    } else {
      console.log(
        `Please either fix these inconsistencies manually or supply the {green.bold -f} flag to automatically fix them.`,
      );
    }
  } else {
    console.log(`└── {green.bold No inconsistencies found}`);
  }
  console.log();

  console.log(`🔍 Looking for invalid keys in source files...`);
  const invalidFiles: string[] = [];

  for (const file of templateFiles.filter((f) => f.type === 'key-based')) {
    const invalidKeys = Object.keys(file.originalContent).filter(
      (k) => typeof file.originalContent[k] === 'string' && k.includes('.'),
    );

    if (invalidKeys.length > 0) {
      invalidFiles.push(file.name);
      console.log(
        `├── {yellow.bold ${file.name} contains} {red.bold ${String(
          invalidKeys.length,
        )}} {yellow.bold invalid key(s)}`,
      );
    }
  }

  if (invalidFiles.length) {
    console.log(
      `└── {yellow.bold Found invalid keys in} {red.bold ${String(
        invalidFiles.length,
      )}} {yellow.bold file(s).}`,
    );

    console.log();
    console.log(
      `It looks like you're trying to use the key-based mode on natural-language-style JSON files.`,
    );
    console.log(
      `Please make sure that your keys don't contain periods (.) or remove the {green.bold --type} / {green.bold -t} option.`,
    );
    console.log();
    process.exit(1);
  } else {
    console.log(`└── {green.bold No invalid keys found}`);
  }
  console.log();

  let addedTranslations = 0;
  let removedTranslations = 0;

  for (const language of targetLanguages) {
    if (!translationService.supportsLanguage(language)) {
      console.log(
        `🙈 {yellow.bold ${translationService.name} doesn't support} {red.bold ${language}}{yellow.bold . Skipping this language.}`,
      );
      console.log();
      continue;
    }

    const existingFiles = loadTranslations(
      path.resolve(workingDir, language),
      fileType,
    );

    console.log(
      `💬 Translating strings from {green.bold ${sourceLang}} to {green.bold ${language}}...`,
    );

    if (deleteUnusedStrings) {
      const templateFileNames = templateFiles.map((t) => t.name);
      const deletableFiles = existingFiles.filter(
        (f) => !templateFileNames.includes(f.name),
      );

      for (const file of deletableFiles) {
        console.log(
          `├── {red.bold ${file.name} is no longer used and will be deleted.}`,
        );

        fs.unlinkSync(path.resolve(workingDir, language, file.name));

        const cacheFile = path.resolve(workingDir, language, file.name);
        if (fs.existsSync(cacheFile)) {
          fs.unlinkSync(cacheFile);
        }
      }
    }

    for (const templateFile of templateFiles) {
      process.stdout.write(`├── Translating ${templateFile.name}`);

      const languageFile = existingFiles.find(
        (f) => f.name === templateFile.name,
      );
      const existingKeys = languageFile
        ? Object.keys(languageFile.content)
        : [];
      const existingTranslations = languageFile ? languageFile.content : {};

      const cachePath = path.resolve(
        resolvedCacheDir,
        sourceLang,
        languageFile ? languageFile.name : '',
      );
      let cacheDiff: string[] = [];
      if (fs.existsSync(cachePath) && !fs.statSync(cachePath).isDirectory()) {
        const cachedFile = flatten(
          JSON.parse(fs.readFileSync(cachePath).toString().trim()),
        );
        const cDiff = diff(cachedFile, templateFile.content);
        cacheDiff = Object.keys(cDiff).filter((k) => (cDiff as any)[k]);
        const changedItems = Object.keys(cacheDiff).length.toString();
        process.stdout.write(
          ` ({green.bold ${changedItems}} changes from cache)`,
        );
      }

      const templateStrings = Object.keys(templateFile.content);
      const stringsToTranslate = templateStrings
        .filter((key) => !existingKeys.includes(key) || cacheDiff.includes(key))
        .map((key) => ({
          key,
          value:
            templateFile.type === 'key-based' ? templateFile.content[key] : key,
        }));

      const unusedStrings = existingKeys.filter(
        (key) => !templateStrings.includes(key),
      );

      const translatedStrings = await translationService.translateStrings(
        stringsToTranslate,
        sourceLang,
        language,
      );

      const newKeys = translatedStrings.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.translated }),
        {} as { [k: string]: string },
      );

      addedTranslations += translatedStrings.length;
      removedTranslations += deleteUnusedStrings ? unusedStrings.length : 0;

      if (service !== 'dry-run') {
        const translatedFile = {
          ...omit(
            existingTranslations,
            deleteUnusedStrings ? unusedStrings : [],
          ),
          ...newKeys,
        };

        const newContent =
          JSON.stringify(
            templateFile.type === 'key-based'
              ? unflatten(translatedFile)
              : translatedFile,
            null,
            2,
          ) + `\n`;

        fs.writeFileSync(
          path.resolve(workingDir, language, templateFile.name),
          newContent,
        );

        const languageCachePath = path.resolve(resolvedCacheDir, language);
        if (!fs.existsSync(languageCachePath)) {
          fs.mkdirSync(languageCachePath);
        }
        fs.writeFileSync(
          path.resolve(languageCachePath, templateFile.name),
          JSON.stringify(translatedFile, null, 2) + '\n',
        );
      }

      console.log(
        deleteUnusedStrings && unusedStrings.length > 0
          ? ` ( +${String(translatedStrings.length)}/ -${String(
              unusedStrings.length,
            )})`
          : ` ( +${String(translatedStrings.length)})`,
      );
    }

    console.log(`└── All strings have been translated.`);
    console.log();
  }

  if (service !== 'dry-run') {
    console.log('🗂 Caching source translation files...');
    await new Promise((res, rej) =>
      ncp(
        path.resolve(workingDir, sourceLang),
        path.resolve(resolvedCacheDir, sourceLang),
        (err) => (err ? rej() : res()),
      ),
    );
    console.log(`└── Translation files have been cached.`);
    console.log();
  }

  console.log(`${addedTranslations} new translations have been added!`);

  if (removedTranslations > 0) {
    console.log(`${removedTranslations} translations have been removed!`);
  }
};
