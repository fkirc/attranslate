import {
  injectPrefixLines,
  runSampleScript,
  sampleDir,
} from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { join } from "path";

const assetDir = "po-generic";
const testScript = "./po_generic.sh";
const mainTarget = join(assetDir, "es.po");
const targetPaths: string[] = [mainTarget, join(assetDir, "de.po")];

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

test("po delete stale translations", async () => {
  injectPrefixLines({
    path: join(sampleDir, mainTarget),
    lines: ['msgid "some new id"', 'msgstr "some new msg"'],
  });
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(`Delete 1 stale translations`);
});
