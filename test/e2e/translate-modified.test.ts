import {
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  onlineMaxTime,
  removeTargetFile,
  runE2E,
  switchToRandomTarget,
} from "./e2e-common";
import { assertPathNotChanged, runCommand } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";
import { join } from "path";

const cacheDirOutdated = join("test-assets", "cache-outdated");
const cacheMissingDir = join("test-assets", "cache-missing");
const cacheMissingFile = `${join(cacheMissingDir, "attranslate-cache*")}`;

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
      srcFile: "test-assets/ios-strings/count-en-slim.strings",
      srcFormat: "ios-strings",
      targetFile: "test-assets/nested-json/count-de.modified.json",
      refTargetFile: "test-assets/nested-json/count-de.less-modified.json",
      targetFormat: "flat-json",
    },
    cleanTargetFile: "test-assets/nested-json/count-de.clean.json",
    maxTime: onlineMaxTime,
  },
];

describe.each(testArray)("translate modified %p", (commonArgs) => {
  async function runMissingTarget(args: E2EArgs): Promise<string> {
    args.targetFile = commonArgs.cleanTargetFile;
    args.refTargetFile = commonArgs.cleanTargetFile;
    await switchToRandomTarget(args, false);
    const output = await runE2E(args, {
      maxTime: commonArgs.maxTime,
    });
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
    await removeTargetFile(args);
    return output;
  }

  test("missing target - clean cache", async () => {
    const args: E2EArgs = { ...commonArgs.args };
    await runMissingTarget(args);
    await assertPathNotChanged(args.cacheDir);
  });

  test("missing target - missing cache", async () => {
    await runCommand(`rm -f ${cacheMissingFile}`);
    const args: E2EArgs = { ...commonArgs.args, cacheDir: cacheMissingDir };
    const output = await runMissingTarget(args);
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    await runCommand(`rm ${cacheMissingFile}`);
  });

  async function runModifiedTarget(
    args: E2EArgs,
    cleanCache: boolean
  ): Promise<string> {
    if (cleanCache) {
      args.refTargetFile = args.targetFile;
    }
    await switchToRandomTarget(args, true);
    const output = await runE2E(args, {
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
    const tempCacheDir = "temp-cache-dir";
    await runCommand(`mkdir ${tempCacheDir}`);
    await runCommand(`cp -r ${cacheDirOutdated + "/*"} ${tempCacheDir}`);
    const args: E2EArgs = { ...commonArgs.args, cacheDir: tempCacheDir };
    const output = await runModifiedTarget(args, false);
    expect(output).toContain("Update 1 existing translations");
    await runCommand(`rm -r ${tempCacheDir}`);
  });

  test("modified target - missing cache", async () => {
    await runCommand(`rm -f ${cacheMissingFile}`);
    const args: E2EArgs = { ...commonArgs.args, cacheDir: cacheMissingDir };
    const output = await runModifiedTarget(args, true);
    expect(output).toContain(
      `Skipped translations because we had to generate a new cache.`
    );
    await runCommand(`rm ${cacheMissingFile}`);
  });
});
