export default async (
  strings: { key: string; value: string }[],
  from: string,
  to: string,
) => {
  console.log();

  if (strings.length > 0) {
    console.log(`├─┌── Translatable strings:`);

    for (const { key, value } of strings) {
      console.log(`│ ├──── ${key !== value ? `(${key}) ` : ''}${value}`);
    }

    process.stdout.write(`│ └── Done`);
  } else {
    process.stdout.write(`│ └── No translatable strings`);
  }

  return [];
};
