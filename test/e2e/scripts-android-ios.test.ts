import { runSampleScript, sampleDir } from "./scripts-e2e-util";
import { joinLines, runCommand } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const assetDirs = ["android", "ios"];

const xmlRecreateTarget = "android/app/src/main/res/values-de/strings.xml";
const xmlModifyTarget = "android/app/src/main/res/values-es/strings.xml";

const targetPaths: string[] = [
  xmlRecreateTarget,
  xmlModifyTarget,
  "ios/Localizable/Base.lproj/Localizable.strings",
  "ios/Localizable/de.lproj/Localizable.strings",
  "ios/Localizable/es.lproj/Localizable.strings",
];

async function runAndroidiOS(): Promise<string> {
  return await runSampleScript(`./android_to_ios.sh`, assetDirs);
}

test("Android to iOS clean", async () => {
  const output = await runAndroidiOS();
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("Delete stale XML entries", async () => {
  await runCommand(
    `cp ${join(sampleDir, xmlModifyTarget + "_modified.xml")} ${join(
      sampleDir,
      xmlModifyTarget
    )}`
  );
  const output = await runAndroidiOS();
  expect(output).toContain(
    `Write target ${getDebugPath(join(sampleDir, xmlModifyTarget))}`
  );
  expect(output).toContain(`Delete 2 stale translations`);
});
