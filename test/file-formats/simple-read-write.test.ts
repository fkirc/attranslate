import { TSet } from "../../src/core/core-definitions";
import { runCommand } from "../test-util";
import { fileFormatMap } from "../../src/file-formats/file-format-definitions";

function expectedTSet(nested: boolean): TSet {
  if (nested) {
    return new Map([
      ["inner.innerInner.one", "One"],
      ["inner.two", "Two"],
      ["three", "Three"],
    ]);
  } else {
    return new Map([
      ["one", "One"],
      ["two", "Two"],
      ["three", "Three"],
    ]);
  }
}

const testArgs: {
  srcFile: string;
  fileFormat: keyof typeof fileFormatMap;
  nested: boolean;
}[] = [
  {
    srcFile: "test-assets/nested-json/count-en.nested.json",
    fileFormat: "nested-json",
    nested: true,
  },
  {
    srcFile: "test-assets/flat-json/count-en.flat.json",
    fileFormat: "nested-json",
    nested: false,
  },
  {
    srcFile: "test-assets/flat-json/count-en.flat.json",
    fileFormat: "flat-json",
    nested: false,
  },
];

describe.each(testArgs)("Read/write %p", (args) => {
  test("Read - delete - write - git-diff", async () => {
    const fileFormat = fileFormatMap[args.fileFormat];
    const tSet = fileFormat.readTFile(args.srcFile, "en");
    expect(tSet).toStrictEqual(expectedTSet(args.nested));
    await runCommand(`rm ${args.srcFile}`);
    fileFormat.writeTFile(args.srcFile, tSet);
    await runCommand(`git diff --exit-code ${args.srcFile}`);
  });
});
