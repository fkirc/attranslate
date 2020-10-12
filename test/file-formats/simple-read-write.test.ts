import { TSet } from "../../src/core/core-definitions";
import { generateId, runCommand } from "../test-util/test-util";
import {
  instantiateTFileFormat,
  TFileType,
} from "../../src/file-formats/file-format-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

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
  fileFormat: TFileType;
  nested: boolean;
}[] = [
  {
    srcFile: "test-assets/android-xml/count-en.indent4.nested.xml",
    fileFormat: "android-xml",
    nested: true,
  },
  {
    srcFile: "test-assets/android-xml/count-en.indent2.flat.xml",
    fileFormat: "android-xml",
    nested: false,
  },
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
  test("Read - write - diff", async () => {
    const fileFormat = await instantiateTFileFormat(args.fileFormat);
    const tSet = fileFormat.readTFile({
      path: args.srcFile,
      lng: "en",
    });

    toStrictEqualMapOrder(tSet, expectedTSet(args.nested));

    const targetFile = `${args.srcFile}_${generateId()}`;
    fileFormat.writeTFile({
      path: targetFile,
      tSet,
      lng: "en",
    });

    const diffCmd = `diff ${args.srcFile} ${targetFile}`;
    await runCommand(diffCmd);
    await runCommand(`rm ${targetFile}`);
  });
});
