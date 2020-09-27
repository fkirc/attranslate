import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { runTranslateExpectFailure } from "../test-util";
import { getDebugPath } from "../../src/util/util";

test("srcFile not existing", async () => {
  const output = await runTranslateExpectFailure(buildE2EArgs(defaultE2EArgs));
  expect(output).toBe(
    `error: ${getDebugPath("some-invalid")} does not exist.\n`
  );
});

const args: E2EArgs = {
  ...defaultE2EArgs,
  srcFile: "package.json",
  cacheDir: "not-existing-cache",
};

test("cacheDir not existing", async () => {
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: ${getDebugPath("not-existing-cache")} does not exist.\n`
  );
});
