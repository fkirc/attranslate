import { readTFile, writeTFile } from "../../src/file-formats/nested-json";
import { TSet } from "../../src/core/core-definitions";
import { runCommand } from "../test-util";

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

describe.each([
  { srcFile: "test-assets/flat-json/count-en.flat.json", nested: false },
  { srcFile: "test-assets/nested-json/count-en.nested.json", nested: true },
])("Read/write %p", (args) => {
  test("Read - delete - write - git-diff", async () => {
    const tSet = readTFile(args.srcFile, "en");
    expect(tSet).toStrictEqual(expectedTSet(args.nested));
    await runCommand(`rm ${args.srcFile}`);
    writeTFile(args.srcFile, tSet);
    await runCommand(`git diff --exit-code ${args.srcFile}`);
  });
});
