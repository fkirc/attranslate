import { TranslationService } from '.';
import languages from '../languages';
import chalk from 'chalk';

export class DryRun implements TranslationService {
  public name = 'Dry Run';

  initialize() {}

  async getAvailableLanguages() {
    return languages;
  }

  async translateStrings(
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) {
    console.log();

    if (strings.length > 0) {
      console.log(`├─┌── Translatable strings:`);

      for (const { key, value } of strings) {
        console.log(`│ ├──── ${key !== value ? `(${key}) ` : ''}${value}`);
      }

      process.stdout.write(chalk`│ └── {green.bold Done}`);
    } else {
      process.stdout.write(chalk`│ └── {green.bold None}`);
    }

    return [];
  }
}
