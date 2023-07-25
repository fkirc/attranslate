import {
  buildE2EArgs,
  defaultE2EArgs,
  E2EArgs,
  switchToRandomTarget,
} from "../e2e/e2e-common";
import { joinLines, runTranslateExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";

test("srcFile not existing", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "not-existing-source",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: srcFile ${getDebugPath("not-existing-source")} does not exist.\n`
  );
});

test("srcFile not a file", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: ".",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(`error: srcFile ${getDebugPath(".")} is a directory.\n`);
});

test("targetFile in dir not existing", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "not-existing-dir/some_file",
  };
  await switchToRandomTarget(args, false);
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: Target path ${getDebugPath("not-existing-dir")} does not exist.\n`
  );
});

test("targetFile not a file", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "src",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args, true));
  expect(output).toBe(`error: ${getDebugPath("src")} is a directory.\n`);
});

test("targetDir not a dir", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "LICENSE/random_target.txt",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: Target path ${getDebugPath("LICENSE")} is not a directory.\n`
  );
});

test("unknown service", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    service: "some-invalid-service" as unknown as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown service "some-invalid-service". Available services: "`
  );
});

test("unknown matcher", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    matcher: "some-invalid-matcher" as unknown as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown matcher "some-invalid-matcher". Available matchers: "`
  );
});

test("unknown source file format", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFormat: "some-invalid-source" as unknown as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown source format "some-invalid-source". Available formats: "`
  );
});

test("unknown target file format", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFormat: "some-invalid-target" as unknown as never,
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Unknown target format "some-invalid-target". Available formats: "`
  );
});

const requiredOptions: (keyof typeof defaultE2EArgs)[] = [
  "srcFile",
  "srcLng",
  "srcFormat",
  "targetFile",
  "targetLng",
  "targetFormat",
  "service",
  "serviceConfig",
];

describe.each(requiredOptions)("Bad options %s", (option) => {
  test(`Missing required option ${option}`, async () => {
    const args: E2EArgs = {
      ...defaultE2EArgs,
      serviceConfig: undefined,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    args[option] = undefined;
    const output = await runTranslateExpectFailure(buildE2EArgs(args));
    if (option === "serviceConfig") {
      expect(output).toBe(
        joinLines([
          "Invoke 'google-translate' from 'en' to 'de' with 3 inputs...",
          "error: Set '--serviceConfig' to a path that points to a GCloud service account JSON file",
        ])
      );
    } else {
      expect(output).toContain(`error: required option '--${option}`);
      expect(output).toContain(`not specified`);
    }
  });

  test(`Empty string option ${option}`, async () => {
    const args: E2EArgs = {
      ...defaultE2EArgs,
    };
    args[option] = "";
    const output = await runTranslateExpectFailure(buildE2EArgs(args));
    expect(output).toBe(
      `error: option '--${option}' is empty -> Either omit it or provide a value\n`
    );
  });

  test(`Empty trim option ${option}`, async () => {
    const args: E2EArgs = {
      ...defaultE2EArgs,
    };
    args[option] = "    ";
    const output = await runTranslateExpectFailure(buildE2EArgs(args));
    expect(output).toBe(
      `error: option '--${option}' is empty -> Either omit it or provide a value\n`
    );
  });
});
