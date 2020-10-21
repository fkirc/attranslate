import { TSet } from "../../src/core/core-definitions";
import { generateId, runCommand } from "../test-util/test-util";
import {
  instantiateTFileFormat,
  TFileType,
} from "../../src/file-formats/file-format-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

function nestedCount(): TSet {
  return new Map([
    ["inner.innerInner.one", "One"],
    ["inner.two", "Two"],
    ["three", "Three"],
  ]);
}

function flatCount(): TSet {
  return new Map([
    ["one", "One"],
    ["two", "Two"],
    ["three", "Three"],
  ]);
}

const testArgs: {
  srcFile: string;
  fileFormat: TFileType;
  expectTSet: TSet;
}[] = [
  {
    srcFile: "test-assets/flutter-arb/intl_en.arb",
    fileFormat: "flutter-arb", // According to https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification
    expectTSet: new Map([["title", "Hello World from intl_en.arb"]]),
  },
  {
    srcFile: "test-assets/ios-strings/count-en-appendix.strings",
    fileFormat: "ios-strings",
    expectTSet: flatCount(),
  },
  {
    srcFile: "test-assets/ios-strings/count-en-slim.strings",
    fileFormat: "ios-strings",
    expectTSet: nestedCount(),
  },
  {
    srcFile: "test-assets/android-xml/sanitize.xml",
    fileFormat: "android-xml",
    expectTSet: new Map([
      ["empty string", ""],
      ["whitespace", "    "],
      ["rounded brackets", "()("],
      ["greater than character is problematic", "> ## [] {}"],
      ["amp", "amp is problematic: \\n&"],
      ["double quotes", '"Double quotes" are problematic'],
    ]),
  },
  {
    srcFile: "test-assets/android-xml/count-en.indent4.nested.xml",
    fileFormat: "android-xml",
    expectTSet: nestedCount(),
  },
  {
    srcFile: "test-assets/android-xml/count-en.indent2.flat.xml",
    fileFormat: "android-xml",
    expectTSet: flatCount(),
  },
  {
    srcFile: "test-assets/nested-json/count-en.json",
    fileFormat: "nested-json",
    expectTSet: nestedCount(),
  },
  {
    srcFile: "test-assets/flat-json/count-empty-null.json",
    fileFormat: "flat-json",
    expectTSet: new Map([
      ["one", ""],
      ["two", " "],
      ["three", null],
    ]),
  },
];

describe.each(testArgs)("Read/write %p", (args) => {
  test("Read - write - diff", async () => {
    const fileFormat = await instantiateTFileFormat(args.fileFormat);
    const tSet: TSet = await fileFormat.readTFile({
      path: args.srcFile,
      lng: "en",
      format: args.fileFormat,
    });

    toStrictEqualMapOrder(tSet, args.expectTSet);

    const targetFile = `${args.srcFile}_${generateId()}`;
    fileFormat.writeTFile({
      path: targetFile,
      tSet,
      lng: "en",
      manualReview: false,
      changeSet: {
        added: new Map(),
        updated: new Map(),
        deleted: new Map(),
        skipped: new Map(),
      },
    });

    const diffCmd = `diff ${args.srcFile} ${targetFile}`;
    await runCommand(diffCmd);
    await runCommand(`rm ${targetFile}`);
  });
});
