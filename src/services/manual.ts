import inquirer from "inquirer";
import { TResult, TService, TServiceArgs } from "./service-definitions";

export class ManualTranslation implements TService {
  async translateStrings(args: TServiceArgs) {
    const results: TResult[] = [];

    console.log(`Start manual translations`);

    for (const { key, value } of args.strings) {
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
        translated: result.result,
      });
    }
    return results;
  }
}
