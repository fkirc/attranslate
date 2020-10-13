import {
  buildE2EArgs,
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  onlineMaxTime,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";
import {
  assertPathChanged,
  runCommand,
  runTranslate,
} from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";
import { join } from "path";

const cacheDirOutdated = join("test-assets", "cache-outdated");

const outdatedCacheTests: {
  args: E2EArgs;
  maxTime: number;
}[] = [
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/flat-json/count-empty-null.flat.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/flat-json/count-empty.flat.modified.json",
      refTargetFile:
        "test-assets/flat-json/count-empty.flat.less-modified.json",
      targetFormat: "nested-json",
    },
    maxTime: offlineMaxTime,
  },
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/nested-json/count-en.nested.json",
      srcFormat: "nested-json",
      targetFile: "test-assets/nested-json/count-de.flattened.modified.json",
      refTargetFile: "test-assets/nested-json/count-de.flattened.json",
      targetFormat: "flat-json",
    },
    maxTime: onlineMaxTime,
  },
];

describe.each(outdatedCacheTests)("outdated cache %p", (commonArgs) => {
  const argsTemplate: E2EArgs = {
    ...defaultE2EArgs,
    ...commonArgs.args,
    cacheDir: cacheDirOutdated,
  };
  async function runWithOutdatedCache(args: E2EArgs): Promise<string> {
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: commonArgs.maxTime,
    });
    expect(output).toContain(`Write cache`);
    await assertPathChanged(args.cacheDir);
    await runCommand(`git checkout ${args.cacheDir}`);
    return output;
  }

  test("missing target", async () => {
    const args = { ...argsTemplate };
    await switchToRandomTarget(args, false);
    const output = await runWithOutdatedCache(args);
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
    await removeTargetFile(args);
  });

  test("modified target", async () => {
    const args = { ...argsTemplate };
    await switchToRandomTarget(args, true);
    const output = await runWithOutdatedCache(args);
    expect(output).toContain("Update 1 existing translations");
    await removeTargetFile(args);
  });
});
