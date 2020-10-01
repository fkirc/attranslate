import inquirer from "inquirer";
import {
  replaceInterpolations,
  reInsertInterpolations,
} from "../matchers/matcher-definitions";
import { TService, TServiceArgs } from "./service-definitions";

export class ManualTranslation implements TService {
  async translateStrings(args: TServiceArgs) {
    const results: { key: string; value: string; translated: string }[] = [];

    console.log(`├─┌── Translatable strings:`);

    for (const { key, value } of args.strings) {
      const { replacements } = replaceInterpolations(
        value,
        args.interpolationMatcher
      );
      process.stdout.write("│ ├── ");

      const result = await inquirer.prompt<{ result: string }>([
        {
          name: "result",
          message: `[${args.srcLng} -> ${args.targetLng}] ${
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
    return results;
  }
}
