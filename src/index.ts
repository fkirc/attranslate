#!/usr/bin/env node

import chalk from 'chalk';
import commander from 'commander';
import * as flatten from 'flattenjs';
import * as fs from 'fs';
import { omit, merge } from 'lodash';
import * as path from 'path';

import { serviceMap } from './services';

require('dotenv').config();

commander
  .option(
    '-i, --input <inputDir>',
    'the directory containing language directories',
    '.',
  )
  .option(
    '-l, --source-language <sourceLang>',
    'specify the source language',
    'en',
  )
  .option(
    '-s, --service <service>',
    `selects the service to be used for translation`,
    'google-translate',
  )
  .option('--list-services', `outputs a list of available services`)
  .option(
    '-c, --config <value>',
    'supply a config parameter (e.g. path to key file) to the translation service',
  )
  .option(
    '-k, --key-based',
    `uses the template file's values instead of the keys as translation source`,
  )
  .option(
    '-f, --fix-inconsistencies',
    `automatically fixes inconsistent key-value pairs by setting the value to the key`,
  )
  .option(
    '-d, --delete-unused-strings',
    `deletes strings in translation files that don't exist in the template`,
  )
  .parse(process.argv);

const getAvailableLanguages = (directory: string) =>
  fs
    .readdirSync(directory)
    .map(d => path.resolve(directory, d))
    .filter(d => fs.statSync(d).isDirectory())
    .map(d => path.basename(d));

const loadTranslations = (directory: string, keyBased: boolean = false) =>
  fs
    .readdirSync(directory)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      originalContent: require(path.resolve(directory, f)),
      content: keyBased
        ? flatten.convert(require(path.resolve(directory, f)))
        : require(path.resolve(directory, f)),
    }));

const fixSourceInconsistencies = (directory: string) => {
  const files = loadTranslations(directory);

  for (const file of files) {
    const fixedContent = Object.keys(file.content).reduce(
      (acc, cur) => ({ ...acc, [cur]: cur }),
      {} as { [k: string]: string },
    );

    fs.writeFileSync(
      path.resolve(directory, file.name),
      JSON.stringify(fixedContent, null, 2),
    );
  }
};

const translate = async (
  inputDir: string = '.',
  sourceLang: string = 'en',
  deleteUnusedStrings = false,
  useKeyBasedFiles = false,
  fixInconsistencies = false,
  service: keyof typeof serviceMap = 'google-translate',
  config?: string,
) => {
  const workingDir = path.resolve(process.cwd(), inputDir);
  const languageFolders = getAvailableLanguages(workingDir);
  const targetLanguages = languageFolders.filter(f => f !== sourceLang);

  if (!languageFolders.includes(sourceLang)) {
    throw new Error(`The source language ${sourceLang} doesn't exist.`);
  }

  if (typeof serviceMap[service] === 'undefined') {
    throw new Error(`The service ${service} doesn't exist.`);
  }

  const translationService = serviceMap[service];

  const templateFiles = loadTranslations(
    path.resolve(workingDir, sourceLang),
    useKeyBasedFiles,
  );

  if (templateFiles.length === 0) {
    throw new Error(
      `The source language ${sourceLang} doesn't contain any JSON files.`,
    );
  }

  console.log(
    chalk`Found {green.bold ${String(
      targetLanguages.length,
    )}} target language(s):`,
  );
  console.log(`-> ${targetLanguages.join(', ')}`);
  console.log();

  console.log(
    chalk`Found {green.bold ${String(templateFiles.length)}} namespace(s):`,
  );
  console.log(`-> ${templateFiles.map(f => f.name).join(', ')}`);
  console.log();

  console.log(`✨ Initializing ${translationService.name}...`);
  translationService.initialize(config);
  process.stdout.write(chalk`├── Getting available languages `);
  const availableLanguages = await translationService.getAvailableLanguages();
  console.log(
    chalk`({green.bold ${String(availableLanguages.length)} languages})`,
  );
  console.log(chalk`└── {green.bold Done}`);
  console.log();

  // Look for inconsistencies in natural-language-style JSON files
  if (!useKeyBasedFiles) {
    console.log(`🔍 Looking for key-value inconsistencies in source files...`);
    const insonsistentFiles: string[] = [];

    for (const file of templateFiles) {
      const inconsistentKeys = Object.keys(file.content).filter(
        key => key !== file.content[key],
      );

      if (inconsistentKeys.length > 0) {
        insonsistentFiles.push(file.name);
        console.log(
          chalk`├── {yellow.bold ${file.name} contains} {red.bold ${String(
            inconsistentKeys.length,
          )}} {yellow.bold inconsistent key(s)}`,
        );
      }
    }

    if (insonsistentFiles.length > 0) {
      console.log(
        chalk`└── {yellow.bold Found key-value inconsistencies in} {red.bold ${String(
          insonsistentFiles.length,
        )}} {yellow.bold file(s).}`,
      );

      console.log();

      if (fixInconsistencies) {
        console.log(`💚 Fixing inconsistencies...`);
        fixSourceInconsistencies(path.resolve(workingDir, sourceLang));
        console.log(chalk`└── {green.bold Fixed all inconsistencies.}`);
      } else {
        console.log(
          chalk`Please either fix these inconsistencies manually or supply the {green.bold -f} flag to automatically fix them.`,
        );
      }
    } else {
      console.log(chalk`└── {green.bold No inconsistencies found.}`);
    }
    console.log();
  }

  if (useKeyBasedFiles) {
    console.log(`🔍 Looking for invalid keys in source files...`);
    const invalidFiles: string[] = [];

    for (const file of templateFiles) {
      const invalidKeys = Object.keys(file.originalContent).filter(
        k => typeof file.originalContent[k] === 'string' && k.includes('.'),
      );

      if (invalidKeys.length > 0) {
        invalidFiles.push(file.name);
        console.log(
          chalk`├── {yellow.bold ${file.name} contains} {red.bold ${String(
            invalidKeys.length,
          )}} {yellow.bold invalid key(s)}`,
        );
      }
    }

    if (invalidFiles.length) {
      console.log(
        chalk`└── {yellow.bold Found invalid keys in} {red.bold ${String(
          invalidFiles.length,
        )}} {yellow.bold file(s).}`,
      );

      console.log();

      console.log(
        chalk`It looks like you're trying to use the key-based mode on natural-language-style JSON files.`,
      );
      console.log(
        chalk`Please make sure that your keys don't contain periods (.) or remove the {green.bold --key-based} / {green.bold -f} flag.`,
      );
      console.log();
      process.exit(1);
    }
  }

  for (const language of targetLanguages) {
    const existingFiles = loadTranslations(
      path.resolve(workingDir, language),
      useKeyBasedFiles,
    );

    console.log(
      chalk`💬 Translating strings from {green.bold ${sourceLang}} to {green.bold ${language}}...`,
    );

    if (deleteUnusedStrings) {
      const templateFileNames = templateFiles.map(t => t.name);
      const deletableFiles = existingFiles.filter(
        f => !templateFileNames.includes(f.name),
      );

      for (const file of deletableFiles) {
        console.log(
          chalk`├── {red.bold ${
            file.name
          } is no longer used and will be deleted.}`,
        );

        fs.unlinkSync(path.resolve(workingDir, language, file.name));
      }
    }

    for (const templateFile of templateFiles) {
      process.stdout.write(`├── Translating ${templateFile.name}`);

      const languageFile = existingFiles.find(
        f => f.name === templateFile.name,
      );
      const existingKeys = languageFile
        ? Object.keys(languageFile.content)
        : [];
      const existingTranslations = languageFile ? languageFile.content : {};

      const templateStrings = Object.keys(templateFile.content);
      const stringsToTranslate = templateStrings
        .filter(key => !existingKeys.includes(key))
        .map(key => ({
          key,
          value: useKeyBasedFiles ? templateFile.content[key] : key,
        }));

      const unusedStrings = existingKeys.filter(
        key => !templateStrings.includes(key),
      );

      const translatedStrings = await translationService.translateStrings(
        stringsToTranslate,
        sourceLang.split('-').pop()!,
        language.split('-').pop()!,
      );

      const newKeys = translatedStrings.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.translated }),
        {} as { [k: string]: string },
      );

      if (service !== 'dryRun') {
        fs.writeFileSync(
          path.resolve(workingDir, language, templateFile.name),
          JSON.stringify(
            merge(
              flatten.undo(
                omit(
                  existingTranslations,
                  deleteUnusedStrings ? unusedStrings : [],
                ),
              ),
              flatten.undo(newKeys),
            ),
            null,
            2,
          ) + `\n`,
        );
      }

      console.log(
        deleteUnusedStrings && unusedStrings.length > 0
          ? chalk` ({green.bold +${String(
              translatedStrings.length,
            )}}/{red.bold -${String(unusedStrings.length)}})`
          : chalk` ({green.bold +${String(translatedStrings.length)}})`,
      );
    }

    console.log(chalk`└── {green.bold All strings have been translated.}`);
    console.log();
  }

  console.log(chalk.green.bold('All new strings have been translated!'));
};

if (commander.listServices) {
  console.log('Available services:');
  console.log(Object.keys(serviceMap).join(', '));
  process.exit(0);
}

translate(
  commander.input,
  commander.sourceLanguage,
  commander.deleteUnusedStrings,
  commander.keyBased,
  commander.fixInconsistencies,
  commander.service,
  commander.config,
).catch(e => {
  console.log();
  console.log(chalk.bgRed('An error has occured:'));
  console.log(chalk.bgRed(e.message));
});
