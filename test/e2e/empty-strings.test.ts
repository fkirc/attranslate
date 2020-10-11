import { runTranslate } from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";
import { CliArgs } from "../../src/core/core-definitions";

const maxTime = 200;

const testArray: Partial<CliArgs>[] = [
  {
    srcFile: "test-assets/invalid/empty-props.json",
    srcFormat: "flat-json",
    targetFile: "test-assets/flat-json/count-de.flat.json",
    targetFormat: "flat-json",
  },
];

describe.each(testArray)("empty props %p", (commonArgs) => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
  };
  test("different empty props", async () => {
    await switchToRandomTarget(args, true);
    const output = await runTranslate(buildE2EArgs(args), { maxTime });
    expect(output).toContain(`Bypass 3 strings because they are empty...`);
    expect(output).toContain("Add 3 new translations");
    await removeTargetFile(args, true);
  });
});
