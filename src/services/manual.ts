import inquirer from "inquirer";
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from "../matchers/matcher-definitions";
import { TranslationService } from "./service-definitions";

export class ManualTranslation implements TranslationService {
  private interpolationMatcher: Matcher | undefined;
  public name = "Manual Translation";

  // eslint-disable-next-line require-await
  async initialize(config?: string, interpolationMatcher?: Matcher) {
    this.interpolationMatcher = interpolationMatcher;
  }

  supportsLanguage() {
    return true;
  }

  async translateStrings(
    strings: { key: string; value: string }[],
    from: string,
    to: string
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
        this.interpolationMatcher
      );
      process.stdout.write("│ ├── ");

      const result = await inquirer.prompt<{ result: string }>([
        {
          name: "result",
          message: `[${from} -> ${to}] ${
            key !== value ? `(${key}) ` : ""
          }"${value}":`,
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
