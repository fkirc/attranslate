export default async (
  strings: { key: string; value: string }[],
  from: string,
  to: string,
) => {
  console.log();

  if (strings.length > 0) {
    console.log(`├─┌── Translatable strings:`);

    for (const string of strings) {
      console.log(`│ ├──── ${string.value}`);
    }

    process.stdout.write(`│ └── Done`);
  } else {
    process.stdout.write(`│ └── No translatable strings`);
  }

  return [];
};
