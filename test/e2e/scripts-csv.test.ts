import { runSampleScript, sampleDir } from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const testScript = "./csv_to_other_formats.sh";
const assetDir = "csv";
const targetPaths: string[] = [
  join(assetDir, "en.xml"),
  join(assetDir, "de.yaml"),
  join(assetDir, "de.json"),
  join(assetDir, "en.json"),
  join(assetDir, "en.strings"),
  join(assetDir, "de.po"),
  join(assetDir, "es.arb"),
  join(assetDir, "single-lang-es.csv"),
  join(assetDir, "single-lang-en.csv"),
];

test("csv clean", async () => {
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("csv re-create", async () => {
  targetPaths.forEach((path) => {
    unlinkSync(join(sampleDir, path));
  });
  const output = await runSampleScript(testScript, [assetDir]);
  targetPaths.forEach((path) => {
    expect(output).toContain(
      `Write target ${getDebugPath(join(sampleDir, path))}`
    );
  });
});
