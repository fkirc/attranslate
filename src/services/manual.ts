import inquirer from "inquirer";
import { TResult, TService, TServiceArgs } from "./service-definitions";

export class ManualTranslation implements TService {
  async translateStrings(args: TServiceArgs) {
    const results: TResult[] = [];

    console.info(`Total number of questions: ${args.strings.length}`);
    console.info(
      `You can skip questions by pressing <ENTER> without any other character.`
    );

    for (const { key, value } of args.strings) {
      const result = await inquirer.prompt<{ result: string }>([
        {
          name: "result",
          message: `(${key}) What is '${value}' in '${args.targetLng}'?`,
        },
      ]);
      const userInput = result.result;
      if (userInput.trim().length) {
        results.push({
          key,
          translated: result.result,
        });
      }
    }
    return results;
  }
}
