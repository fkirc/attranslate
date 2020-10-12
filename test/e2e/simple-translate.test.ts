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
import { getDebugPath, readJsonFile, writeJsonFile } from "../../src/util/util";
import { CliArgs } from "../../src/core/core-definitions";

const cacheDirOutdated = join("test-assets", "cache-outdated");
const cacheMissingDir = join("test-assets", "cache-missing");

const testArray: { cliArgs: Partial<CliArgs>; maxTime: number }[] = [
  {
    cliArgs: {
      srcFile: "test-assets/flat-json/count-empty-null.flat.json",
      srcFormat: "flat-json",
      targetFile: "test-assets/flat-json/count-empty.flat.json",
      targetFormat: "nested-json",
    },
    maxTime: offlineMaxTime,
  },
  {
    cliArgs: {
      srcFile: "test-assets/nested-json/count-en.nested.json",
      srcFormat: "nested-json",
      targetFile: "test-assets/nested-json/count-de.flattened.json",
      targetFormat: "flat-json",
    },
    maxTime: onlineMaxTime,
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
    await preModifiedTarget(args);
    const output = await runWithOutdatedCache(args);
    expect(output).toContain("Update 1 existing translations");
    await postModifiedTarget(args);
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
    await preModifiedTarget(args);
    const output = await runTranslate(buildE2EArgs(args), {
      maxTime: offlineMaxTime,
    });
    expect(output).toBe(`Target is up-to-date: '${args.targetFile}'\n`);
    await postModifiedTarget(args);
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
    await preModifiedTarget(args);
    const output = await runWithMissingCache(args, offlineMaxTime);
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    await postModifiedTarget(args);
  });
});

async function preModifiedTarget(args: CliArgs) {
  await switchToRandomTarget(args, true);
  modifyFirstTwoProperties(args.targetFile);
}

async function postModifiedTarget(args: CliArgs) {
  await removeTargetFile(args, true);
}

async function preMissingTarget(args: CliArgs) {
  await switchToRandomTarget(args, false);
}

async function postMissingTarget(args: CliArgs, output: string) {
  expect(output).toContain(`Add 3 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
  await removeTargetFile(args, false);
}

function modifyFirstTwoProperties(jsonPath: string) {
  const json: Record<string, unknown> = readJsonFile(jsonPath);
  const keys = Object.keys(json);
  json[keys[0]] += " modified 1";
  json[keys[1]] += " modified 2";
  writeJsonFile(jsonPath, json);
}
