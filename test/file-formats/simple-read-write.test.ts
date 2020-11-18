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
  writeRawJson,
} from "../../src/file-formats/common/managed-json";
import { join } from "path";

const testAssets = "test-assets";

const testArgs: {
  srcFile: string;
  fileFormat: TFileType;
}[] = [
  {
    srcFile: join(testAssets, "po", "django_sample.po"),
    fileFormat: "po",
  },
  {
    srcFile: join(testAssets, "po", "sample.pot"),
    fileFormat: "po",
  },
  {
    srcFile: join(testAssets, "yml", "jekyll_ecommerce.yml"),
    fileFormat: "yaml",
  },
  {
    srcFile: join(testAssets, "yml", "symfony2.yml"),
    fileFormat: "yaml",
  },
  {
    srcFile: join(testAssets, "yml", "country_array.yml"),
    fileFormat: "yaml",
  },
  {
    srcFile: join(testAssets, "yml", "rails_i18n.yml"),
    fileFormat: "yaml",
  },
  {
    srcFile: join(testAssets, "android-xml", "non-android.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "android-xml", "advanced.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "android-xml", "plurals.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "flutter-arb", "intl_en.arb"),
    fileFormat: "arb",
  },
  {
    srcFile: join(testAssets, "ios-strings", "count-en-appendix.strings"),
    fileFormat: "ios-strings",
  },
  {
    srcFile: join(testAssets, "ios-strings", "count-en-slim.strings"),
    fileFormat: "ios-strings",
  },
  {
    srcFile: join(testAssets, "android-xml", "sanitize.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "android-xml", "count-en.indent4.nested.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "android-xml", "count-en.indent2.flat.xml"),
    fileFormat: "xml",
  },
  {
    srcFile: join(testAssets, "nested-json", "count-en.json"),
    fileFormat: "nested-json",
  },
  {
    srcFile: join(testAssets, "flat-json", "count-empty-null.json"),
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
      keySearch: "x",
      keyReplace: "x",
    });

    const expectTSetPath = `${args.srcFile}__expected_tset.json`;
    if (process.env.GENERATE_REFS) {
      writeRawJson({
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
      format: args.fileFormat,
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
