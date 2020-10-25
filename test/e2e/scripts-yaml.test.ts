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
  if (process.env.CI) {
    return;
  }
  const path = join(sampleDir, targetPaths[0]);
  injectPrefixLines({
    path,
    lines: [
      "injected.1: 'first'",
      "injected_outer:",
      "  injected_inner: 'inner val'",
    ],
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
  expect(output).toContain(`Add 4 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(path)}`);
});

test("yml insert inner elements", async () => {
  const path = join(sampleDir, targetPaths[0]);
  removeLines({
    path,
    linesToRemove: [
      "    inner_footer:",
      "      inner_block1:",
      "        inner_title: 'Legal'",
      "        inner_link1: 'Protección de Datos'",
    ],
  });
  const output = await runSampleScript(ymlScript, [assetDir]);
  expect(output).toContain(`Add 2 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(path)}`);
});
