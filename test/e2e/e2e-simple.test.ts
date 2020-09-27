import { runCommand, runTranslate } from "../test-util";
import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";

describe.each([
  {
    src: "test-assets/hello-en-flat.json",
    target: "test-assets/hello-de-flat.json",
  },
  {
    src: "test-assets/hello-en-nested.json",
    target: "test-assets/hello-de-nested.json",
  },
])("simple translate", (args) => {
  const commonArgs: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: args.src,
    targetFile: args.target,
  };
  test("up-to-date cache, up-to-date target", async () => {
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  });

  test("up-to-date cache, missing target", async () => {
    await runCommand(`rm ${args.target}`);
    const output = await runTranslate(buildE2EArgs(commonArgs));
    expect(output).toContain("Add 3 new translations");
    expect(output).toContain("Write target-file");
  });
});
