import { runTranslate } from "../test-util/test-util";
import { readRawJson } from "../../src/file-formats/common/managed-json";

function getExpectedVersion(): string {
  const packageJson = readRawJson("package.json").object as { version: string };
  const version = packageJson.version;
  expect(version).toContain(".");
  return version + "\n";
}

test("--version", async () => {
  const output = await runTranslate(`--version`, {
    pwd: "/",
  });
  expect(output).toBe(getExpectedVersion());
});

test("-v", async () => {
  const output = await runTranslate(`-v`);
  expect(output).toBe(getExpectedVersion());
});
