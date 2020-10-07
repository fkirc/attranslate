import { runCommand, runTranslate } from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs } from "./e2e-common";
import { join } from "path";
import { getDebugPath, readJsonFile, writeJsonFile } from "../../src/util/util";
import { CliArgs } from "../../src/core/core-definitions";
const cacheDir = "test-assets/cache/";
const cacheOutdatedDir = "test-assets/cache-outdated/";
const cacheMissingDir = "test-assets/cache-missing/";

const testArgs: Partial<CliArgs>[] = [
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

describe.each(testArgs)("translate %p", (args) => {
  const commonArgs: CliArgs = {
    ...defaultE2EArgs,
    ...args,
    cacheDir,
  };
  test("up-to-date cache, missing target", async () => {
    await runCommand(`rm ${args.targetFile}`);
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toContain("Add 3 new translations");
    expect(output).toContain("Write target-file");
  });

  test("up-to-date cache, clean target", async () => {
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  });

  test("up-to-date cache, modified target", async () => {
    modifyFirstTwoProperties(commonArgs.targetFile);
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
    await runCommand(`git checkout ${args.targetFile}`);
  });

  const outdatedCacheArgs: CliArgs = {
    ...commonArgs,
    cacheDir: cacheOutdatedDir,
  };
  test("outdated cache, missing target", async () => {
    await runCommand(`rm ${args.targetFile}`);
    const output = await runTranslate(buildE2EArgs(outdatedCacheArgs));
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheOutdatedDir);
    await runCommand(`git checkout ${cacheOutdatedDir}`);
  });

  test("outdated cache, clean target", async () => {
    const output = await runTranslate(buildE2EArgs(outdatedCacheArgs));
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheOutdatedDir);
    await runCommand(`git checkout ${cacheOutdatedDir}`);
  });

  test("outdated cache, modified target", async () => {
    modifyFirstTwoProperties(commonArgs.targetFile);
    const output = await runTranslate(buildE2EArgs(outdatedCacheArgs));
    expect(output).toContain("Update 1 existing translations\n");
    expect(output).toContain(
      `Write target-file ${getDebugPath(commonArgs.targetFile)}`
    );
    expect(output).toContain(`Write cache`);
    await runCommand(`git checkout ${cacheOutdatedDir}`);
    await runCommand(`git checkout ${commonArgs.targetFile}`);
  });

  const missingCacheArgs: CliArgs = {
    ...commonArgs,
    cacheDir: cacheMissingDir,
  };
  const cacheMissingFile = `${join(
    cacheMissingDir,
    "attranslate-cache-*.json"
  )}`;
  test("missing cache, missing target", async () => {
    await runCommand(`rm ${cacheMissingFile}`);
    await runCommand(`rm ${commonArgs.targetFile}`);
    const output = await runTranslate(buildE2EArgs(missingCacheArgs));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write cache`);
    expect(output).toContain(
      `Write target-file ${getDebugPath(commonArgs.targetFile)}`
    );
  });

  test("missing cache, clean target", async () => {
    await runCommand(`rm ${cacheMissingFile}`);
    const output = await runTranslate(buildE2EArgs(missingCacheArgs));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    expect(output).toContain(`Write cache`);
  });

  test("missing cache, modified target", async () => {
    await runCommand(`rm ${cacheMissingFile}`);
    modifyFirstTwoProperties(commonArgs.targetFile);
    const output = await runTranslate(buildE2EArgs(missingCacheArgs));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    expect(output).toContain(`Write cache`);
    await runCommand(`git checkout ${commonArgs.targetFile}`);
  });
});

function modifyFirstTwoProperties(jsonPath: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = readJsonFile(jsonPath);
  const keys = Object.keys(json);
  json[keys[0]] += " modified 1";
  json[keys[1]] += " modified 2";
  writeJsonFile(jsonPath, json);
}
