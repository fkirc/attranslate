import inquirer from "inquirer";
import { TResult, TService, TServiceArgs } from "./service-definitions";

export class AgentTranslation implements TService {
  async translateStrings(args: TServiceArgs) {
    const results: TResult[] = [];

    console.info(`Translating ${args.strings.length} string(s) to ${args.targetLng}...`);

    for (const { key, value } of args.strings) {
      const result = await inquirer.prompt<{ result: string }>([
        {
          name: "result",
          message: `[${key}] Translate "${value}" to ${args.targetLng}:`,
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

    console.info(`Done.`);
    return results;
  }
}
