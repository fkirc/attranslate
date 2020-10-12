import {
  assertPathChanged,
  runCommand,
  runTranslate,
} from "../test-util/test-util";
import {
  buildE2EArgs,
  defaultE2EArgs,
  offlineMaxTime,
  onlineMaxTime,
  removeTargetFile,
  switchToRandomTarget,
} from "./e2e-common";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";
import { CliArgs } from "../../src/core/core-definitions";

const cacheDirOutdated = join("test-assets", "cache-outdated");
const cacheMissingDir = join("test-assets", "cache-missing");

const testArray: {
  cliArgs: Partial<CliArgs>;
  maxTime: number;
  modifiedTarget: string;
}[] = [
  {
    cliArgs: {
      srcFile: "test-assets/flat-json/count-empty-null.flat.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/flat-json/count-empty.flat.json",
      targetFormat: "nested-json",
    },
    maxTime: offlineMaxTime,
    modifiedTarget: "test-assets/flat-json/count-empty.flat.modified.json",
  },
  {
    cliArgs: {
      srcFile: "test-assets/nested-json/count-en.nested.json",
      srcFormat: "nested-json",
      targetFile: "test-assets/nested-json/count-de.flattened.json",
      targetFormat: "flat-json",
    },
    maxTime: onlineMaxTime,
    modifiedTarget: "test-assets/nested-json/count-de.flattened.modified.json",
  },
];

describe.each(testArray)("outdated cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs.cliArgs,
    cacheDir: cacheDirOutdated,
  };
  async function runWithOutdatedCache(args: CliArgs): Promise<string> {
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
    await preMissingTarget(args);
    const output = await runWithOutdatedCache(args);
    await postMissingTarget(args, output);
  });

  test("modified target", async () => {
    const args = { ...argsTemplate };
    await preModifiedTarget(args, commonArgs.modifiedTarget);
    const output = await runWithOutdatedCache(args);
    expect(output).toContain("Update 1 existing translations");
    await postModifiedTarget(args, true);
  });
});

describe.each(testArray)("clean cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs.cliArgs,
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
    await preModifiedTarget(args, commonArgs.modifiedTarget);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: offlineMaxTime,
    });
    expect(output).toBe(`Target is up-to-date: '${args.targetFile}'\n`);
    await postModifiedTarget(args, false);
  });
});

describe.each(testArray)("missing cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs.cliArgs,
    cacheDir: cacheMissingDir,
  };
  const cacheMissingFile = `${join(cacheMissingDir, "attranslate-cache-*")}`;

  async function runWithMissingCache(
    args: CliArgs,
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
    await preModifiedTarget(args, commonArgs.modifiedTarget);
    const output = await runWithMissingCache(args, offlineMaxTime);
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    await postModifiedTarget(args, false);
  });
});

async function preModifiedTarget(args: CliArgs, modifiedTarget: string) {
  args.targetFile = modifiedTarget;
  await switchToRandomTarget(args, true);
}

async function postModifiedTarget(args: CliArgs, expectModified: boolean) {
  await removeTargetFile(args, expectModified);
}

async function preMissingTarget(args: CliArgs) {
  await switchToRandomTarget(args, false);
}

async function postMissingTarget(args: CliArgs, output: string) {
  expect(output).toContain(`Add 3 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
  await removeTargetFile(args, false);
}
