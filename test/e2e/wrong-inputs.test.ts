import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { runTranslateExpectFailure } from "../test-util";
import { getDebugPath } from "../../src/util/util";

test("srcFile not existing", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "not-existing-source",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: ${getDebugPath("not-existing-source")} does not exist.\n`
  );
});

test("targetFile in dir not existing", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "not-existing-dir/target",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: ${getDebugPath("not-existing-dir")} does not exist.\n`
  );
});

test("cacheDir not existing", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    cacheDir: "not-existing-cache",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: ${getDebugPath("not-existing-cache")} does not exist.\n`
  );
});

test("src not a JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "README.md",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(`error: Failed to parse ${getDebugPath("README.md")}.\n`);
});

test("target not a JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "README.md",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(`error: Failed to parse ${getDebugPath("README.md")}.\n`);
});

test("unknown service", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    service: ("some-invalid-matcher" as unknown) as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown service "some-invalid-matcher". Available services: "`
  );
});

test("unknown matcher", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    matcher: ("some-invalid-matcher" as unknown) as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown matcher "some-invalid-matcher". Available matchers: "`
  );
});

const requiredOptions: (keyof typeof defaultE2EArgs)[] = [
  "srcFile",
  "srcLng",
  "targetFile",
  "targetLng",
  "service",
  "serviceConfig",
];

describe.each(requiredOptions)("Missing required option %s", (option) => {
  test(`Missing required option ${option}`, async () => {
    const args: E2EArgs = {
      ...defaultE2EArgs,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    args[option] = undefined;
    const output = await runTranslateExpectFailure(buildE2EArgs(args));
    expect(output).toContain(`error: required option '--${option}`);
    expect(output).toContain(`not specified`);
  });
});
