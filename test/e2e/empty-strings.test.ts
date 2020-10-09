import { runTranslate } from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  injectJsonProperties,
} from "./e2e-common";
import { join } from "path";
import { CliArgs } from "../../src/core/core-definitions";
import { getDebugPath } from "../../src/util/util";

const cacheDirClean = join("test-assets", "cache");
const testArray: Partial<CliArgs>[] = [
  {
    srcFile: "test-assets/flat-json/count-en.flat.json",
    srcFormat: "flat-json",
    targetFile: "test-assets/flat-json/count-de.flat.json",
    targetFormat: "flat-json",
  },
];

describe.each(testArray)("inject empty %p", (commonArgs) => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
    cacheDir: cacheDirClean,
  };
  test("inject empty string into srcFile", async () => {
    injectJsonProperties(args.srcFile, { emptyProp: "" });
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(
      `Warning: 'emptyProp' in ${getDebugPath(args.srcFile)} is empty.`
    );
    expect(output).toContain("Nothing changed, translations are up-to-date.");
  });

  test("inject spaces into srcFile", async () => {
    injectJsonProperties(args.srcFile, { spacesProp: "   " });
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(`Warning: Skip 'spacesProp' because it is empty.`);
    expect(output).toContain("Nothing changed, translations are up-to-date.");
  });
});
