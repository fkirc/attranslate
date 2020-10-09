import {
  assertPathChanged,
  assertPathNotChanged,
  generateId,
  runCommand,
  runTranslate,
} from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs } from "./e2e-common";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";
import { CliArgs } from "../../src/core/core-definitions";

const cacheDirOutdated = join("test-assets", "cache-outdated");
const cacheMissingDir = join("test-assets", "cache-missing");

const testArray: Partial<CliArgs>[] = [
  {
    srcFile: "test-assets/flat-json/count-en.flat.json",
    srcFormat: "flat-json",
    targetFile: "test-assets/flat-json/count-de.flat.json",
    targetFormat: "nested-json",
  },
  {
    srcFile: "test-assets/nested-json/count-en.nested.json",
    srcFormat: "nested-json",
    targetFile: "test-assets/nested-json/count-de.flattened.json",
    targetFormat: "flat-json",
  },
];

describe.each(testArray)("outdated cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
    cacheDir: cacheDirOutdated,
  };
  async function runWithOutdatedCache(args: CliArgs): Promise<string> {
    const output = await runTranslate(buildE2EArgs(args));
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

  test("clean target", async () => {
    const args = { ...argsTemplate };
    await preCleanTarget(args);
    await runWithOutdatedCache(args);
    await postCleanTarget(args);
  });
});

describe.each(testArray)("clean cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
  };
  test("missing target", async () => {
    const args = { ...argsTemplate };
    await preMissingTarget(args);
    const output = await runTranslate(buildE2EArgs(args));
    await postMissingTarget(args, output);
  });

  test("clean target", async () => {
    const args = { ...argsTemplate };
    await preCleanTarget(args);
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toBe("Target is up-to-date.\n");
    await postCleanTarget(args);
  });
});

describe.each(testArray)("missing cache %p", (commonArgs) => {
  const argsTemplate: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
    cacheDir: cacheMissingDir,
  };
  const cacheMissingFile = `${join(cacheMissingDir, "attranslate-cache-*")}`;

  async function runWithMissingCache(args: CliArgs): Promise<string> {
    await runCommand(`rm -f ${cacheMissingFile}`);
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(`Write cache`);
    return output;
  }

  test("missing target", async () => {
    const args = { ...argsTemplate };
    await preMissingTarget(args);
    const output = await runWithMissingCache(args);
    await postMissingTarget(args, output);
  });

  test("clean target", async () => {
    const args = { ...argsTemplate };
    await preCleanTarget(args);
    const output = await runWithMissingCache(args);
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    await postCleanTarget(args);
  });
});

function switchToRandomTargetFile(args: CliArgs) {
  const randomTargetFile = `${args.targetFile}_${generateId()}`;
  args.refTargetFile = args.targetFile;
  args.targetFile = randomTargetFile;
}

async function removeRandomTargetFile(args: CliArgs) {
  await runCommand(`diff ${args.targetFile} ${args.refTargetFile}`);
  await runCommand(`rm ${args.targetFile}`);
}

function preMissingTarget(args: CliArgs) {
  switchToRandomTargetFile(args);
}

async function postMissingTarget(args: CliArgs, output: string) {
  expect(output).toContain(`Add 3 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
  await removeRandomTargetFile(args);
}

async function preCleanTarget(args: CliArgs) {
  await assertPathNotChanged(args.targetFile);
}

async function postCleanTarget(args: CliArgs) {
  await assertPathNotChanged(args.targetFile);
}
