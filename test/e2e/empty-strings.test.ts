import { runTranslate } from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs } from "./e2e-common";
import { CliArgs } from "../../src/core/core-definitions";

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
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(`Warning: Skip 'nullProp' because it is empty.`);
    expect(output).toContain(`Warning: Skip 'spacesProp' because it is empty.`);
    expect(output).toContain("Target is up-to-date.");
  });
});
