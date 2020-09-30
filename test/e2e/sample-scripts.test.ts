import { runCommand } from "../test-util";

test("flat_json", async () => {
  const output = await runCommand(`./sample-scripts/flat_json.sh`);
  expect(output).toContain("Add 3 new translations");
  expect(output).toContain("Write target-file");
});
