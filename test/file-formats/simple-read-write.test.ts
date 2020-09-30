import { TSet } from "../../src/core/core-definitions";
import { runCommand } from "../test-util";
import { fileFormatMap } from "../../src/file-formats/file-format-definitions";

function expectedTSet(nested: boolean): TSet {
  if (nested) {
    return {
      lng: "en",
      translations: new Map([
        ["inner.innerInner.one", "One"],
        ["inner.two", "Two"],
        ["three", "Three"],
      ]),
    };
  } else {
    return {
      lng: "en",
      translations: new Map([
        ["one", "One"],
        ["two", "Two"],
        ["three", "Three"],
      ]),
    };
  }
}
// TODO: Parameterize this test with file + serializer + nested

const fileFormat = fileFormatMap["nested-json"];

describe.each([
  { srcFile: "test-assets/flat-json/count-en.flat.json", nested: false },
  { srcFile: "test-assets/nested-json/count-en.nested.json", nested: true },
])("Read/write %p", (args) => {
  test("Read - delete - write - git-diff", async () => {
    const tSet = fileFormat.readTFile(args.srcFile, "en");
    expect(tSet).toStrictEqual(expectedTSet(args.nested));
    await runCommand(`rm ${args.srcFile}`);
    fileFormat.writeTFile(args.srcFile, tSet);
    await runCommand(`git diff --exit-code ${args.srcFile}`);
  });
});
