import { TSet } from "../../src/core/core-definitions";
import {
  generateId,
  mapToObject,
  objectToMap,
  runCommand,
} from "../test-util/test-util";
import {
  instantiateTFileFormat,
  TFileType,
} from "../../src/file-formats/file-format-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";
import {
  readRawJson,
  writeManagedJson,
} from "../../src/file-formats/common/managed-json";

const testArgs: {
  srcFile: string;
  fileFormat: TFileType;
}[] = [
  {
    srcFile: "test-assets/android-xml/plurals.xml",
    fileFormat: "android-xml",
  },
  {
    srcFile: "test-assets/android-xml/advanced.xml",
    fileFormat: "android-xml",
  },
  {
    srcFile: "test-assets/flutter-arb/intl_en.arb",
    fileFormat: "flutter-arb", // According to https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification
  },
  {
    srcFile: "test-assets/ios-strings/count-en-appendix.strings",
    fileFormat: "ios-strings",
  },
  {
    srcFile: "test-assets/ios-strings/count-en-slim.strings",
    fileFormat: "ios-strings",
  },
  {
    srcFile: "test-assets/android-xml/sanitize.xml",
    fileFormat: "android-xml",
  },
  {
    srcFile: "test-assets/android-xml/count-en.indent4.nested.xml",
    fileFormat: "android-xml",
  },
  {
    srcFile: "test-assets/android-xml/count-en.indent2.flat.xml",
    fileFormat: "android-xml",
  },
  {
    srcFile: "test-assets/nested-json/count-en.json",
    fileFormat: "nested-json",
  },
  {
    srcFile: "test-assets/flat-json/count-empty-null.json",
    fileFormat: "flat-json",
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

    const expectTSetPath = `${args.srcFile}__expected_tset.json`;
    if (process.env.GENERATE_REFS) {
      writeManagedJson({
        path: expectTSetPath,
        object: mapToObject(tSet),
      });
    }
    const expectTSet: TSet = objectToMap(readRawJson(expectTSetPath).object);
    toStrictEqualMapOrder(tSet, expectTSet);

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
