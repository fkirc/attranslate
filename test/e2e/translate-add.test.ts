import { runTranslate } from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";

const testArray: {
  args: E2EArgs;
  toContain: string;
  addCount: number;
}[] = [
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/misc-json/empty-props.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/nested-json/count-de.clean.json",
      refTargetFile: "test-assets/misc-json/empty-props+count-de.json",
      targetFormat: "flat-json",
    },
    toContain: `Bypass 3 strings because they are empty...`,
    addCount: 3,
  },
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/android-xml/count-en.indent2.flat.xml",
      srcFormat: "android-xml",
      targetFile: "test-assets/android-xml/count-de.missing-entry.xml",
      refTargetFile: "test-assets/android-xml/count-de.xml",
      targetFormat: "android-xml",
      targetLng: "en",
      service: "sync-without-translate",
    },
    toContain:
      "Invoke 'sync-without-translate' from 'en' to 'en' with 1 inputs...",
    addCount: 1,
  },
];

describe.each(testArray)("translate add %p", (commonArgs) => {
  test("add new translations", async () => {
    const args: E2EArgs = { ...commonArgs.args };
    await switchToRandomTarget(args, true);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: offlineMaxTime,
    });
    expect(output).toContain(commonArgs.toContain);
    expect(output).toContain(`Add ${commonArgs.addCount} new translations`);
    await removeTargetFile(args);
  });
});
