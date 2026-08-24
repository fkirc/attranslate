import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { runTranslateExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";

test("src not a JSON", async () => {
  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile: "test-assets/invalid/not-a-json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain(
    `error: Failed to parse ${getDebugPath(args.srcFile)}.\n`
  );
});

describe.each([
  {
    srcFile: "test-assets/invalid/wrong-separator.csv",
    format: "csv",
    errorMessage:
      "Expected at least 2 columns in CSV header with separator ','",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    format: "csv",
    errorMessage:
      "Expected at least 2 columns in CSV header with separator ','",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/bogus-lang.csv",
    format: "csv",
    errorMessage: "Did not find language 'en' in CSV header 'keys,bogus-lang'",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/nested-json/count-en.json",
    format: "xml",
    errorMessage: "XML parsing error",
    auxMessage: "Error: Non-whitespace before first tag",
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    format: "yaml",
    errorMessage: "Implicit map keys need to be on a single line",
    auxMessage: "Implicit map keys need to be followed by map values",
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    format: "po",
    errorMessage: "GetText parsing error",
    auxMessage: "SyntaxError: Error parsing PO data",
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.xml",
    format: "xml",
    errorMessage:
      "duplicate key 'dup' -> Currently, the usage of duplicate translation-keys is discouraged.",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.csv",
    format: "csv",
    errorMessage:
      "duplicate key 'dup_csv' -> Currently, the usage of duplicate translation-keys is discouraged.",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.strings",
    format: "ios-strings",
    errorMessage:
      "duplicate key 'dup_ios' -> Currently, the usage of duplicate translation-keys is discouraged",
    auxMessage: `Warning: Parsing 'test-assets/invalid/duplicate-keys.strings': Line 'other content' seems to be unexpected`,
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.yml",
    format: "yaml",
    errorMessage:
      'Map keys must be unique; "question" is repeated at line 1, column 1',
    auxMessage: "question: 'What do I do when I have forgotten my login?",
  },
  {
    srcFile: "test-assets/nested-json/count-en.json",
    format: "flat-json",
    errorMessage: "Property 'inner' is not a string or null",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/whitespace",
    format: "yaml",
    errorMessage: "root node not found",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/not-a-json",
    format: "ios-strings",
    errorMessage: "Did not find any Strings in the expected format",
    auxMessage: "Line '#' seems to be unexpected",
  },
  {
    srcFile: "test-assets/invalid/whitespace",
    format: "ios-strings",
    errorMessage: "Did not find any Strings in the expected format",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/empty",
    format: "ios-strings",
    errorMessage: "Did not find any Strings in the expected format",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/empty",
    format: "csv",
    errorMessage: "Expected at least 2 CSV lines (header + content)",
    auxMessage: null,
  },
])(
  "src parsing error",
  (args: {
    srcFile: string;
    format: string;
    errorMessage: string;
    auxMessage: string | null;
  }) => {
    test("src parsing error", async () => {
      const e2eArgs: E2EArgs = {
        ...defaultE2EArgs,
        srcFile: args.srcFile,
        format: args.format,
      };
      const output = await runTranslateExpectFailure(buildE2EArgs(e2eArgs));
      const expectedOutput = `error: Failed to parse ${getDebugPath(
        args.srcFile
      )} with expected format '${args.format}': ${args.errorMessage}`;
      if (args.auxMessage) {
        expect(output).toContain(expectedOutput);
        expect(output).toContain(args.auxMessage);
      } else {
        expect(output).toBe(expectedOutput + "\n");
      }
    });
  }
);

describe.each([
  { srcFile: "test-assets/invalid/empty.json", format: "flat-json" },
  { srcFile: "test-assets/invalid/empty.json", format: "nested-json" },
  { srcFile: "test-assets/invalid/empty.xml", format: "xml" },
  { srcFile: "test-assets/invalid/empty", format: "xml" },
  { srcFile: "test-assets/invalid/whitespace", format: "xml" },
  { srcFile: "test-assets/invalid/empty", format: "yaml" },
  { srcFile: "test-assets/invalid/empty", format: "po" },
  { srcFile: "test-assets/invalid/whitespace", format: "po" },
])("empty src", (args: { srcFile: string; format: string }) => {
  test("empty src", async () => {
    const e2eArgs: E2EArgs = {
      ...defaultE2EArgs,
      srcFile: args.srcFile,
      format: args.format,
    };
    const output = await runTranslateExpectFailure(buildE2EArgs(e2eArgs));
    expect(output).toBe(
      `error: ${getDebugPath(
        args.srcFile
      )} does not contain any translatable content\n`
    );
  });
});

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
