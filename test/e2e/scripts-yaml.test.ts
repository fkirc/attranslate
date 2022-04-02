import {
  injectPrefixLines,
  runSampleScript,
  sampleDir,
} from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const assetDir = "yaml";
const ymlScript = "./yaml_ecommerce.sh";
const mainTarget = join(assetDir, "es_ecommerce.yml");
const nonCachedTarget = join(assetDir, "nested-fruits.yml");
const targetPaths: string[] = [
  mainTarget,
  join(assetDir, "de_ecommerce.yml"),
  nonCachedTarget,
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

test("yml re-create target", async () => {
  const targetPath = nonCachedTarget;
  unlinkSync(join(sampleDir, targetPath));
  const output = await runSampleScript(ymlScript, [assetDir]);
  expect(output).toContain(
    `Write target ${getDebugPath(join(sampleDir, targetPath))}`
  );
});

test("yml delete stale translations", async () => {
  const path = join(sampleDir, mainTarget);
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
