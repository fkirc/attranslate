import { assertPathNotChanged, runCommand } from "../test-util/test-util";

const sampleDir = "sample-scripts";

test("flat_json", async () => {
  const output = await runCommand(`./flat_json.sh`, sampleDir);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await assertPathNotChanged(sampleDir);
});
