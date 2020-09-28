import { readTFile, writeTFile } from "../../src/serializers/nested-json";
import { TSet } from "../../src/core/core-definitions";
import { runCommand } from "../test-util";

// TODO: Fix output format to pass these tests.

describe.each([
  { srcFile: "test-assets/flat-json/count-en.flat.json" },
  { srcFile: "test-assets/nested-json/count-en.nested.json" },
])("Simple read-write", (args) => {
  test("Read-write %p", async () => {
    const tSet = readTFile(args.srcFile, "en");
    const expectTSet: TSet = {
      lng: "en",
      translations: new Map([
        ["one", "One"],
        ["two", "Two"],
        ["three", "Three"],
      ]),
    };
    expect(tSet).toStrictEqual(expectTSet);
    writeTFile(args.srcFile, tSet);
    await runCommand(`git diff --exit-code ${args.srcFile}`);
  });
});
