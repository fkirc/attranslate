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
  cleanTargetFile: string;
  maxTime: number;
}[] = [
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/flat-json/count-empty-null.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/flat-json/count-empty.modified.json",
      refTargetFile: "test-assets/flat-json/count-empty.less-modified.json",
      targetFormat: "nested-json",
    },
    cleanTargetFile: "test-assets/flat-json/count-empty.clean.json",
    maxTime: offlineMaxTime,
  },
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/nested-json/count-en.json",
      srcFormat: "nested-json",
      targetFile: "test-assets/nested-json/count-de.modified.json",
      refTargetFile: "test-assets/nested-json/count-de.less-modified.json",
      targetFormat: "flat-json",
    },
    cleanTargetFile: "test-assets/nested-json/count-de.clean.json",
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
    args.targetFile = commonArgs.cleanTargetFile;
    args.refTargetFile = commonArgs.cleanTargetFile;
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
