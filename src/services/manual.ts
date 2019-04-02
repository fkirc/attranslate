import inquirer from 'inquirer';
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from '../replacers';
import languages from '../util/languages';
import { TranslationService } from '.';

export class ManualTranslation implements TranslationService {
  private interpolationMatcher: Matcher;
  public name = 'Manual Translation';

  initialize(config?, interpolationMatcher?: Matcher) {
    this.interpolationMatcher = interpolationMatcher;
  }

  async getAvailableLanguages() {
    return languages;
  }

  async translateStrings(
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) {
    const results: { key: string; value: string; translated: string }[] = [];

    if (strings.length === 0) {
      return [];
    }

    console.log();
    console.log(`├─┌── Translatable strings:`);

    for (const { key, value } of strings) {
      const { replacements } = replaceInterpolations(
        value,
        this.interpolationMatcher,
      );
      process.stdout.write('│ ├── ');

      const result = await inquirer.prompt<{ result: string }>([
        {
          name: 'result',
          message: `[${from} -> ${to}] ${
            key !== value ? `(${key}) ` : ''
          }${value}:`,
        },
      ]);

      results.push({
        key,
        value,
        translated: reInsertInterpolations(result.result, replacements),
      });
    }

    process.stdout.write(`│ └── Done`);

    return results;
  }
}
