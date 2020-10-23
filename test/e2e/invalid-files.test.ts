import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { joinLines, runTranslateExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";

test("src not a JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/not-a-json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain("Unexpected token # in JSON at position 13");
  expect(output).toContain(
    `error: Failed to parse ${getDebugPath(args.srcFile)}.\n`
  );
});

test("src not an XML", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFormat: "android-xml",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain("Error: Non-whitespace before first tag");
  expect(output).toContain(
    `error: Failed to parse ${getDebugPath(
      args.srcFile
    )} with expected format '${args.srcFormat}': XML parsing error`
  );
});

test("duplicate keys XML", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/duplicate-keys.xml",
    srcFormat: "android-xml",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: Failed to parse ${getDebugPath(
      args.srcFile
    )} with expected format '${
      args.srcFormat
    }': duplicate key 'dup' -> Currently, the usage of duplicate translation-keys is discouraged.\n`
  );
});

test("duplicate keys iOS", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/duplicate-keys.strings",
    srcFormat: "ios-strings",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  const expectedOutput = joinLines([
    `Warning: Parsing '${args.srcFile}': Line 'other content' seems to be unexpected`,
    `error: Failed to parse ${getDebugPath(
      args.srcFile
    )} with expected format '${
      args.srcFormat
    }': duplicate key 'dup_ios' -> Currently, the usage of duplicate translation-keys is discouraged.`,
  ]);
  expect(output).toBe(expectedOutput);
});

test("invalid iOS strings", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/empty.json",
    srcFormat: "ios-strings",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    joinLines([
      `Warning: Line '{}' seems to be unexpected`,
      `error: Failed to parse ${getDebugPath(
        "test-assets/invalid/empty.json"
      )} with expected format '${
        args.srcFormat
      }': Did not find any Strings in the expected format`,
    ])
  );
});

test("src empty JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/empty.json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    `error: ${getDebugPath(
      args.srcFile
    )} does not contain any translatable content\n`
  );
});

test("target non-flat JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    targetFile: "test-assets/nested-json/count-en.json",
    targetFormat: "flat-json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args, true));
  expect(output).toBe(
    `error: Failed to parse ${getDebugPath(
      args.targetFile
    )} with expected format '${
      args.targetFormat
    }': Property 'inner' is not a string or null\n`
  );
});

// test("unsupported cache version", async () => {
//   const args: E2EArgs = {
//     ...defaultE2EArgs,
//     cacheDir: "test-assets/invalid",
//   };
//   const output = await runTranslateExpectFailure(buildE2EArgs(args));
//   expect(output).toContain(
//     "error: A cache error occurred: Version '0' is not supported. You may try to delete "
//   );
// });

/*test("src duplicate JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/duplicate-property.json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(`error: ${getDebugPath(args.srcFile)} -dup--\n`);
});
test("src duplicate nested JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/duplicate-nested-property.json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(`error: ${getDebugPath(args.srcFile)} -dup--\n`);
});*/
