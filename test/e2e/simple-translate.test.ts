import {
  assertPathChanged,
  runCommand,
  runTranslate,
} from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  E2EArgs,
  offlineMaxTime,
  onlineMaxTime,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const cacheDirOutdated = join("test-assets", "cache-outdated");
const cacheMissingDir = join("test-assets", "cache-missing");

const testArray: {
  args: E2EArgs;
  maxTime: number;
  addCount: number;
}[] = [
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
    maxTime: offlineMaxTime,
    addCount: 1,
  },
  {
    args: {
      ...defaultE2EArgs,
      srcFile: "test-assets/flat-json/count-empty-null.flat.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/flat-json/count-empty.flat.modified.json",
      refTargetFile: "test-assets/flat-json/count-empty.flat.json",
      targetFormat: "nested-json",
    },
    maxTime: offlineMaxTime,
    addCount: 0,
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
    addCount: 0,
  },
];

describe.each(testArray)("outdated cache %p", (commonArgs) => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await assertPathChanged(args.cacheDir!);
    await runCommand(`git checkout ${args.cacheDir}`);
    return output;
  }

  test("missing target", async () => {
    const args = { ...argsTemplate };
    await preMissingTarget(args);
    const output = await runWithOutdatedCache(args);
    await postMissingTarget(args, output);
  });

  test("modified target", async () => {
    const args = { ...argsTemplate };
    await switchToRandomTarget(args, true);
    const output = await runWithOutdatedCache(args);
    if (!commonArgs.addCount) {
      expect(output).toContain("Update 1 existing translations");
    } else {
      expect(output).toContain(`Add ${commonArgs.addCount} new translations`);
    }
    await removeTargetFile(args);
  });
});

describe.each(testArray)("clean cache %p", (commonArgs) => {
  const argsTemplate: E2EArgs = {
    ...defaultE2EArgs,
    ...commonArgs.args,
  };
  test("missing target", async () => {
    const args = { ...argsTemplate };
    await preMissingTarget(args);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: commonArgs.maxTime,
    });
    await postMissingTarget(args, output);
  });

  test("modified target", async () => {
    const args = { ...argsTemplate };
    args.refTargetFile = args.targetFile;
    await switchToRandomTarget(args, true);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: commonArgs.addCount ? commonArgs.maxTime : offlineMaxTime,
    });
    if (!commonArgs.addCount) {
      expect(output).toBe(`Target is up-to-date: '${args.targetFile}'\n`);
    } else {
      expect(output).toContain(`Add ${commonArgs.addCount} new translations`);
    }
    await removeTargetFile(args);
  });
});

describe.each(testArray)("missing cache %p", (commonArgs) => {
  const argsTemplate: E2EArgs = {
    ...defaultE2EArgs,
    ...commonArgs.args,
    cacheDir: cacheMissingDir,
  };
  const cacheMissingFile = `${join(cacheMissingDir, "attranslate-cache-*")}`;

  async function runWithMissingCache(
    args: E2EArgs,
    maxTime: number
  ): Promise<string> {
    await runCommand(`rm -f ${cacheMissingFile}`);
    const output = await runTranslate(buildE2EArgs(args), { maxTime });
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(`Write cache`);
    await runCommand(`rm ${cacheMissingFile}`);
    return output;
  }

  test("missing target", async () => {
    const args = { ...argsTemplate };
    await preMissingTarget(args);
    const output = await runWithMissingCache(args, commonArgs.maxTime);
    await postMissingTarget(args, output);
  });

  test("modified target", async () => {
    const args = { ...argsTemplate };
    args.refTargetFile = args.targetFile;
    await switchToRandomTarget(args, true);
    const maxTime = commonArgs.addCount ? commonArgs.maxTime : offlineMaxTime;
    const output = await runWithMissingCache(args, maxTime);
    if (!commonArgs.addCount) {
      expect(output).toContain(
        "Skipped translations because we had to generate a new cache."
      );
    } else {
      expect(output).toContain(`Add ${commonArgs.addCount} new translations`);
    }
    await removeTargetFile(args);
  });
});

async function preMissingTarget(args: E2EArgs) {
  args.targetFile = args.refTargetFile;
  await switchToRandomTarget(args, false);
}

async function postMissingTarget(args: E2EArgs, output: string) {
  expect(output).toContain(`Add 3 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
  await removeTargetFile(args);
}
