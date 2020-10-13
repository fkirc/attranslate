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

const testArray: {
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

describe.each(testArray)("translate modified %p", (commonArgs) => {
  async function runMissingTarget(args: E2EArgs) {
    args.targetFile = commonArgs.cleanTargetFile;
    args.refTargetFile = commonArgs.cleanTargetFile;
    await switchToRandomTarget(args, false);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: commonArgs.maxTime,
    });
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
    await removeTargetFile(args);
  }

  test("missing target - clean cache", async () => {
    const args: E2EArgs = { ...commonArgs.args };
    await runMissingTarget(args);
  });

  async function runModifiedTarget(
    args: E2EArgs,
    cleanCache: boolean
  ): Promise<string> {
    if (cleanCache) {
      args.refTargetFile = args.targetFile;
    }
    await switchToRandomTarget(args, true);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: commonArgs.maxTime,
    });
    await removeTargetFile(args);
    return output;
  }

  test("modified target - clean cache", async () => {
    const args: E2EArgs = { ...commonArgs.args };
    const output = await runModifiedTarget(args, true);
    expect(output).toBe(`Target is up-to-date: '${args.targetFile}'\n`);
  });

  test("modified target - outdated cache", async () => {
    const args: E2EArgs = { ...commonArgs.args, cacheDir: cacheDirOutdated };
    const output = await runModifiedTarget(args, false);
    expect(output).toContain("Update 1 existing translations");
    await assertPathChanged(args.cacheDir);
    await runCommand(`git checkout ${args.cacheDir}`);
  });
});
