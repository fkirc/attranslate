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

const assetDir = "po-generic";
const testScript = "./po_generic.sh";
const targetPaths: string[] = [
  join(assetDir, "es.po"),
  join(assetDir, "de.po"),
  join(assetDir, "nested-fruits.po"),
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

test("po re-create targets", async () => {
  if (process.env.CI) {
    return;
  }
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

test("po delete stale translations", async () => {
  const path = join(sampleDir, targetPaths[0]);
  injectPrefixLines({
    path,
    lines: ['msgid "some new id"', 'msgstr "some new msg"'],
  });
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(`Delete 1 stale translations`);
});

test("po insert new translations", async () => {
  const path = join(sampleDir, targetPaths[0]);
  removeLines({
    path,
    linesToRemove: [
      'msgid "Confirm E-mail Address"',
      'msgstr "Please confirm your email address"', // TODO: change to spanish
    ],
  });
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(`Add 1 new translations`);
});
