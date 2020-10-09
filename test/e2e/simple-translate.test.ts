import {
  assertPathChanged,
  assertPathNotChanged,
  runCommand,
  runTranslate,
} from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs } from "./e2e-common";
import { join } from "path";
import { getDebugPath, readJsonFile, writeJsonFile } from "../../src/util/util";
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
  const args: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
    cacheDir: cacheDirOutdated,
  };
  async function runWithOutdatedCache(): Promise<string> {
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(`Write cache`);
    await assertPathChanged(args.cacheDir);
    await runCommand(`git checkout ${args.cacheDir}`);
    return output;
  }

  test("missing target", async () => {
    await preMissingTarget(args);
    const output = await runWithOutdatedCache();
    await postMissingTarget(args, output);
  });

  test("clean target", async () => {
    await preCleanTarget(args);
    await runWithOutdatedCache();
    await postCleanTarget(args);
  });

  test("modified target", async () => {
    await preModifiedTarget(args);
    const output = await runWithOutdatedCache();
    expect(output).toContain("Update 1 existing translations\n");
    expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
    await postModifiedTarget(args);
  });
});

describe.each(testArray)("clean cache %p", (commonArgs) => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
  };
  test("missing target", async () => {
    await preMissingTarget(args);
    const output = await runTranslate(buildE2EArgs(args));
    await postMissingTarget(args, output);
  });

  test("clean target", async () => {
    await preCleanTarget(args);
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
    await postCleanTarget(args);
  });

  test("modified target", async () => {
    await preModifiedTarget(args);
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
    await assertPathChanged(args.targetFile);
    await postModifiedTarget(args);
  });
});

describe.each(testArray)("missing cache %p", (commonArgs) => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    ...commonArgs,
    cacheDir: cacheMissingDir,
  };
  const cacheMissingFile = `${join(
    cacheMissingDir,
    "attranslate-cache-*.json"
  )}`;

  async function runWithMissingCache(): Promise<string> {
    await runCommand(`rm ${cacheMissingFile}`);
    const output = await runTranslate(buildE2EArgs(args));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(`Write cache`);
    return output;
  }

  test("missing target", async () => {
    await preMissingTarget(args);
    const output = await runWithMissingCache();
    await postMissingTarget(args, output);
  });

  test("clean target", async () => {
    await preCleanTarget(args);
    const output = await runWithMissingCache();
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    await postCleanTarget(args);
  });

  test("modified target", async () => {
    await preModifiedTarget(args);
    const output = await runWithMissingCache();
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    await postModifiedTarget(args);
  });
});

async function preMissingTarget(args: CliArgs) {
  await runCommand(`rm ${args.targetFile}`);
}

async function postMissingTarget(args: CliArgs, output: string) {
  expect(output).toContain(`Add 3 new translations`);
  expect(output).toContain(`Write target ${getDebugPath(args.targetFile)}`);
  await assertPathNotChanged(args.targetFile);
}

async function preCleanTarget(args: CliArgs) {
  await assertPathNotChanged(args.targetFile);
}

async function postCleanTarget(args: CliArgs) {
  await assertPathNotChanged(args.targetFile);
}

async function preModifiedTarget(args: CliArgs) {
  modifyFirstTwoProperties(args.targetFile);
  await assertPathChanged(args.targetFile);
}

async function postModifiedTarget(args: CliArgs) {
  await runCommand(`git checkout ${args.targetFile}`);
}

function modifyFirstTwoProperties(jsonPath: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = readJsonFile(jsonPath);
  const keys = Object.keys(json);
  json[keys[0]] += " modified 1";
  json[keys[1]] += " modified 2";
  writeJsonFile(jsonPath, json);
}
