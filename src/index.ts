#!/usr/bin/env node

import commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { omit } from 'lodash';

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
    'googleTranslate',
  )
  .option('--list-services', `outputs a list of available services`)
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

const loadTranslations = (directory: string) =>
  fs
    .readdirSync(directory)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      content: require(path.resolve(directory, f)),
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
  service: keyof typeof serviceMap = 'googleTranslate',
) => {
  const workingDir = path.resolve(process.cwd(), inputDir);
  const availableLanguages = getAvailableLanguages(workingDir);
  const targetLanguages = availableLanguages.filter(f => f !== sourceLang);

  if (!availableLanguages.includes(sourceLang)) {
    throw new Error(`The source language ${sourceLang} doesn't exist.`);
  }

  if (typeof serviceMap[service] === 'undefined') {
    throw new Error(`The service ${service} doesn't exist.`);
  }

  const templateFiles = loadTranslations(path.resolve(workingDir, sourceLang));

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

  if (!useKeyBasedFiles) {
    console.log(`🔍 Looking for key-value inconsistencies in source files`);
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
        console.log(`💚 Fixing inconsistencies`);
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

  for (const language of targetLanguages) {
    const existingFiles = loadTranslations(path.resolve(workingDir, language));

    console.log(`💬 Translating strings from ${sourceLang} to ${language}`);

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

      const translatedStrings = await serviceMap[service](
        stringsToTranslate,
        sourceLang.split('-').pop()!,
        language.split('-').pop()!,
      );

      const newKeys = translatedStrings.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.translated }),
        {} as { [k: string]: string },
      );

      fs.writeFileSync(
        path.resolve(workingDir, language, templateFile.name),
        JSON.stringify(
          {
            ...omit(
              existingTranslations,
              deleteUnusedStrings ? unusedStrings : [],
            ),
            ...newKeys,
          },
          null,
          2,
        ),
      );

      console.log(
        deleteUnusedStrings && unusedStrings.length > 0
          ? chalk` ({green.bold +${String(
              translatedStrings.length,
            )}}/{red.bold -${String(unusedStrings.length)}})`
          : chalk` ({green.bold +${String(translatedStrings.length)}})`,
      );
    }

    console.log(chalk`└── All strings have been translated.`);
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
).catch(e => {
  console.log();
  console.log(chalk.bgRed('An error has occured:'));
  console.log(chalk.bgRed(e.message));
});
