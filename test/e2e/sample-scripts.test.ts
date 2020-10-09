import { assertPathNotChanged, runCommand } from "../test-util/test-util";

const sampleDir = "sample-scripts";

test("simple_translate", async () => {
  const output = await runCommand(`./simple_translate.sh`, sampleDir);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await assertPathNotChanged(sampleDir);
});

test("multi_translate", async () => {
  const output = await runCommand(`./multi_translate.sh`, sampleDir);
  expect(output).toBe(
    "Nothing changed, translations are up-to-date.\nNothing changed, translations are up-to-date.\nNothing changed, translations are up-to-date.\n"
  );
  await assertPathNotChanged(sampleDir);
});
