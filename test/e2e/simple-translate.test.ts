import { runCommand, runTranslate } from "../test-util";
import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";
const cacheDir = "test-assets/cache/";
const cacheOutdatedDir = "test-assets/cache-outdated/";
const cacheMissingDir = "test-assets/cache-missing/";

describe.each([
  {
    src: "test-assets/flat-json/count-en.flat.json",
    target: "test-assets/flat-json/count-de.flat.json",
  },
  {
    src: "test-assets/nested-json/count-en.nested.json",
    target: "test-assets/nested-json/count-de.nested.json",
  },
])("translate %p", (args) => {
  const commonArgs: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: args.src,
    targetFile: args.target,
    cacheDir,
  };
  test("up-to-date cache, missing target", async () => {
    await runCommand(`rm ${args.target}`);
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toContain("Add 3 new translations");
    expect(output).toContain("Write target-file");
  });

  test("up-to-date cache, up-to-date target", async () => {
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  });

  const outdatedCacheArgs: E2EArgs = {
    ...commonArgs,
    cacheDir: cacheOutdatedDir,
  };
  test("outdated cache, missing target", async () => {
    await runCommand(`rm ${args.target}`);
    const output = await runTranslate(buildE2EArgs(outdatedCacheArgs));
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheOutdatedDir);
    await runCommand(`git checkout ${cacheOutdatedDir}`);
  });

  test("outdated cache, up-to-date target", async () => {
    const output = await runTranslate(buildE2EArgs(outdatedCacheArgs));
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheOutdatedDir);
    await runCommand(`git checkout ${cacheOutdatedDir}`);
  });

  const missingCacheArgs: E2EArgs = {
    ...commonArgs,
    cacheDir: cacheMissingDir,
  };
  test("missing cache, missing target", async () => {
    await runCommand(
      `rm -f ${join(cacheMissingDir, "attranslate-cache*.json")}`
    );
    await runCommand(`rm ${args.target}`);
    const output = await runTranslate(buildE2EArgs(missingCacheArgs));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(`Add 3 new translations`);
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheMissingDir);
    expect(output).toContain(`Write target-file ${getDebugPath(args.target)}`);
  });

  test("missing cache, up-to-date target", async () => {
    await runCommand(
      `rm -f ${join(cacheMissingDir, "attranslate-cache*.json")}`
    );
    const output = await runTranslate(buildE2EArgs(missingCacheArgs));
    expect(output).toContain(
      `Cache not found -> Generate a new cache to enable selective translations.`
    );
    expect(output).toContain(
      "Skipped translations because we had to generate a new cache."
    );
    expect(output).toContain(`Write cache`);
    expect(output).toContain(cacheMissingDir);
  });
});
