import { joinLines } from "../test-util/test-util";
import { runSampleScript, sampleDir } from "./sample-scripts-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const targetPaths: string[] = [
  "android/app/src/main/res/values-de/strings.xml",
  "android/app/src/main/res/values-es/strings.xml",
  "ios/Localizable/Base.lproj/Localizable.strings",
  "ios/Localizable/de.lproj/Localizable.strings",
  "ios/Localizable/es.lproj/Localizable.strings",
];

test("Android to iOS clean", async () => {
  const output = await runSampleScript(`./android_to_ios.sh`);
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("Android to iOS re-create targets", async () => {
  targetPaths.forEach((path) => {
    unlinkSync(join(sampleDir, path));
  });
  const output = await runSampleScript(`./android_to_ios.sh`);
  targetPaths.forEach((path) => {
    expect(output).toContain(
      `Write target ${getDebugPath(join(sampleDir, path))}`
    );
  });
});
