import {
  injectPrefixLines,
  runSampleScript,
  sampleDir,
} from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const assetDir = "po-generic";
const testScript = "./po_generic.sh";
const mainTarget = join(assetDir, "es.po");
const nonCachedTarget = join(assetDir, "nested-fruits.po");
const targetPaths: string[] = [
  mainTarget,
  join(assetDir, "de.po"),
  nonCachedTarget,
];

test("po clean", async () => {
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("po re-create non-cached target", async () => {
  const removeTarget = nonCachedTarget;
  unlinkSync(join(sampleDir, removeTarget));
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(
    `Write target ${getDebugPath(join(sampleDir, removeTarget))}`
  );
});

test("po delete stale translations", async () => {
  injectPrefixLines({
    path: join(sampleDir, mainTarget),
    lines: ['msgid "some new id"', 'msgstr "some new msg"'],
  });
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(`Delete 1 stale translations`);
});
