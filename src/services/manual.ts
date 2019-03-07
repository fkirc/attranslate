import inquirer from 'inquirer';
import { replaceIcu, reInsertIcu } from '../icu';

export default async (
  strings: { key: string; value: string }[],
  from: string,
  to: string,
) => {
  const results: { key: string; original: string; translated: string }[] = [];

  if (strings.length === 0) {
    return [];
  }

  console.log();
  console.log(`├─┌── Translatable strings:`);

  for (const string of strings) {
    const { replacements } = replaceIcu(string.value);
    process.stdout.write('│ ├── ');

    const result = await inquirer.prompt<{ result: string }>([
      {
        name: 'result',
        message: `[${from} -> ${to}] ${
          string.key !== string.value ? `(${string.key}) ` : ''
        }${string.value}:`,
      },
    ]);

    results.push({
      key: string.key,
      original: string.value,
      translated: reInsertIcu(result.result, replacements),
    });
  }

  process.stdout.write(`│ └── Done`);

  return results;
};
