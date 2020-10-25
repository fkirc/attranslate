import {
  injectPrefixLines,
  removeLines,
  runSampleScript,
  sampleDir,
} from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const assetDir = "yaml";
const ymlScript = "./yaml_ecommerce.sh";
const targetPaths: string[] = [
  join(assetDir, "es_ecommerce.yml"),
  join(assetDir, "de_ecommerce.yml"),
  join(assetDir, "nested-fruits.yml"),
];

test("yml clean", async () => {
  const output = await runSampleScript(ymlScript, [assetDir]);
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("yml re-create targets", async () => {
  targetPaths.forEach((path) => {
    unlinkSync(join(sampleDir, path));
  });
  const output = await runSampleScript(ymlScript, [assetDir]);
  targetPaths.forEach((path) => {
    expect(output).toContain(
      `Write target ${getDebugPath(join(sampleDir, path))}`
    );
  });
});

test("yml delete stale translations", async () => {
  const path = join(sampleDir, targetPaths[0]);
  injectPrefixLines({
    path,
    lines: ["injected.1: 'first'", "injected.2: 'second'"],
  });
  const output = await runSampleScript(ymlScript, [assetDir]);
  expect(output).toContain(`Delete 2 stale translations`);
  expect(output).toContain(`Write target ${getDebugPath(path)}`);
});

test("yml insert new translations", async () => {
  const path = join(sampleDir, targetPaths[0]);
  removeLines({
    path,
    linesToRemove: [
      "  impressum: 'Impressum'",
      "  gdpr: 'Reglamento de protección de datos'",
      "  conditions: 'GT&C'",
      "  cancellation: 'Cancelación'",
    ],
  });
  const output = await runSampleScript(ymlScript, [assetDir]);
  expect(output).toContain(`Add 8 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(path)}`);
});
