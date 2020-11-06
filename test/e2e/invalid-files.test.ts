import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";
import { runTranslateExpectFailure } from "../test-util/test-util";
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

describe.each([
  {
    srcFile: "test-assets/nested-json/count-en.json",
    srcFormat: "xml",
    errorMessage: "XML parsing error",
    auxMessage: "Error: Non-whitespace before first tag",
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    srcFormat: "yaml",
    errorMessage: "Implicit map keys need to be on a single line",
    auxMessage: "Implicit map keys need to be followed by map values",
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    srcFormat: "po",
    errorMessage: "GetText parsing error",
    auxMessage: "SyntaxError: Error parsing PO data",
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.xml",
    srcFormat: "xml",
    errorMessage:
      "duplicate key 'dup' -> Currently, the usage of duplicate translation-keys is discouraged.",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.strings",
    srcFormat: "ios-strings",
    errorMessage:
      "duplicate key 'dup_ios' -> Currently, the usage of duplicate translation-keys is discouraged",
    auxMessage: `Warning: Parsing 'test-assets/invalid/duplicate-keys.strings': Line 'other content' seems to be unexpected`,
  },
  {
    srcFile: "test-assets/invalid/duplicate-keys.yml",
    srcFormat: "yaml",
    errorMessage:
      'Map keys must be unique; "question" is repeated at line 1, column 1',
    auxMessage: "question: 'What do I do when I have forgotten my login?",
  },
  {
    srcFile: "test-assets/nested-json/count-en.json",
    srcFormat: "flat-json",
    errorMessage: "Property 'inner' is not a string or null",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/whitespace",
    srcFormat: "yaml",
    errorMessage: "root node not found",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/whitespace",
    srcFormat: "ios-strings",
    errorMessage: "Did not find any Strings in the expected format",
    auxMessage: null,
  },
  {
    srcFile: "test-assets/invalid/whitespace",
    srcFormat: "po",
    errorMessage: "GetText parsing error",
    auxMessage: "TypeError: Cannot set property 'X-Generator' of undefined",
  },
])(
  "src parsing error",
  (args: {
    srcFile: string;
    srcFormat: string;
    errorMessage: string;
    auxMessage: string | null;
  }) => {
    test("src parsing error", async () => {
      const e2eArgs: E2EArgs = {
        ...defaultE2EArgs,
        srcFile: args.srcFile,
        srcFormat: args.srcFormat,
      };
      const output = await runTranslateExpectFailure(buildE2EArgs(e2eArgs));
      const expectedOutput = `error: Failed to parse ${getDebugPath(
        args.srcFile
      )} with expected format '${args.srcFormat}': ${args.errorMessage}`;
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
  { srcFile: "test-assets/invalid/empty.json", srcFormat: "flat-json" },
  { srcFile: "test-assets/invalid/empty.json", srcFormat: "nested-json" },
  { srcFile: "test-assets/invalid/empty.xml", srcFormat: "xml" },
  { srcFile: "test-assets/invalid/empty", srcFormat: "xml" },
  { srcFile: "test-assets/invalid/whitespace", srcFormat: "xml" },
  { srcFile: "test-assets/invalid/empty", srcFormat: "yaml" },
  { srcFile: "test-assets/invalid/empty", srcFormat: "po" },
])("empty src", (args: { srcFile: string; srcFormat: string }) => {
  test("empty src", async () => {
    const e2eArgs: E2EArgs = {
      ...defaultE2EArgs,
      srcFile: args.srcFile,
      srcFormat: args.srcFormat,
    };
    const output = await runTranslateExpectFailure(buildE2EArgs(e2eArgs));
    expect(output).toBe(
      `error: ${getDebugPath(
        args.srcFile
      )} does not contain any translatable content\n`
    );
  });
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
