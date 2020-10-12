import { runTranslate } from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";

const testArray: E2EArgs[] = [
  {
    ...defaultE2EArgs,
    srcFile: "test-assets/misc-json/empty-props.json",
    srcFormat: "flat-json",
    targetFile: "test-assets/flat-json/count-de.flat.json",
    targetFormat: "flat-json",
    refTargetFile: "test-assets/misc-json/empty-props+count-de.json",
  },
];

describe.each(testArray)("empty props %p", (commonArgs) => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
  };
  test("different empty props", async () => {
    await switchToRandomTarget(args, true);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: offlineMaxTime,
    });
    expect(output).toContain(`Bypass 3 strings because they are empty...`);
    expect(output).toContain("Add 3 new translations");
    await removeTargetFile(args);
  });
});
