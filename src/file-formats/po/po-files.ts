import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { GetTextTranslations, po } from "gettext-parser";
import { FormatCache } from "../common/format-cache";
import { readManagedUtf8, writeManagedUtf8 } from "../common/managed-utf8";
import { extractPotTranslations, parsePotFile } from "./po-ops";

interface PotAuxData {
  potFile: GetTextTranslations;
  rawFile: string;
}
const potCache = new FormatCache<unknown, PotAuxData>();

export class PoFile implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const rawFile = readManagedUtf8(args.path);
    const potFile = parsePotFile(args, rawFile);
    const tSet = extractPotTranslations(potFile);
    potCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: { potFile, rawFile },
    });
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const auxData = potCache.getOldestAuxdata();
    let output: string;
    if (!auxData) {
      output = createUncachedPot(args);
    } else {
      output = createCachedPot(auxData);
    }
    writeManagedUtf8({ path: args.path, utf8: output });
    potCache.purge();
  }
}

const compileOptions = {
  foldLength: 100,
  sort: false,
};

function createCachedPot(auxData: PotAuxData): string {
  const buffer = po.compile(auxData.potFile, compileOptions);
  return buffer.toString("utf-8");
}

function createUncachedPot(args: WriteTFileArgs): string {
  const potFile: GetTextTranslations = {
    charset: "utf-8",
    headers: {},
    translations: {},
  };
  args.tSet.forEach((value, key) => {
    potFile.translations[key] = {
      key: {
        msgid: key,
        msgstr: [value ?? ""],
      },
    };
  });
  const buffer = po.compile(potFile, compileOptions);
  return buffer.toString("utf-8") + "\n";
}
