import { runCommand } from "../test-util";

test("flat_json", async () => {
  const output = await runCommand(`./sample-scripts/flat_json.sh`);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await runCommand(`git diff --exit-code test-assets/`);
});
