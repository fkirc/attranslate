import {
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  removeTargetFile,
  runE2E,
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
      // Use the new single-format flag for this test.
      // (defaultE2EArgs uses legacy src/target formats for conversion tests)
      srcFormat: undefined,
      targetFormat: undefined,
      format: "flat-json",
      targetFile: "test-assets/nested-json/count-de.clean.json",
      refTargetFile: "test-assets/misc-json/empty-props+count-de.json",
    },
    toContain: `Bypass 3 strings because they are empty...`,
    addCount: 3,
  },
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/android-xml/count-en.indent2.flat.xml",
      srcFormat: undefined,
      targetFormat: undefined,
      format: "xml",
      targetFile: "test-assets/android-xml/count-de.missing-entry.xml",
      refTargetFile: "test-assets/android-xml/count-de.xml",
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
    const output = await runE2E(args, {
      maxTime: offlineMaxTime,
    });
    expect(output).toContain(commonArgs.toContain);
    expect(output).toContain(`Add ${commonArgs.addCount} new translations`);
    await removeTargetFile(args);
  });
});
