import { runCommand } from "../test-util";

const sampleDir = "sample-scripts";

test("flat_json", async () => {
  const output = await runCommand(`./flat_json.sh`, sampleDir);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await runCommand(`git diff --exit-code ${sampleDir}`);
});
