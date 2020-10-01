import { runCommand } from "../test-util";

test("flat_json", async () => {
  const output = await runCommand(`./flat_json.sh`, "sample-scripts");
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await runCommand(`git diff --exit-code test-assets/`);
});
