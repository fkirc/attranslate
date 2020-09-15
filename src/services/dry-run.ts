import { TranslationService, TString } from '.';

export class DryRun implements TranslationService {
  public name = 'Dry Run';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async initialize() {}

  supportsLanguage() {
    return true;
  }

  // eslint-disable-next-line require-await
  async translateStrings(strings: TString[]) {
    console.log();

    if (strings.length > 0) {
      console.log(`├─┌── Translatable strings:`);

      for (const { key, value } of strings) {
        console.log(`│ ├──── ${key !== value ? `(${key}) ` : ''}${value}`);
      }

      process.stdout.write(`│ └── Done`);
    } else {
      process.stdout.write(`│ └── None`);
    }

    return [];
  }
}
