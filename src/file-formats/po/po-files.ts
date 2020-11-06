import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { GetTextComment, GetTextTranslations, po } from "gettext-parser";
import { FormatCache } from "../common/format-cache";
import { readManagedUtf8, writeManagedUtf8 } from "../common/managed-utf8";
import {
  extractPotTranslations,
  parsePotFile,
  updatePotTranslations,
} from "./po-ops";

interface PotAuxData {
  potFile: GetTextTranslations;
  rawFile: string;
}
interface PotCacheEntry {
  comments: GetTextComment;
}
export const potCache = new FormatCache<PotCacheEntry, PotAuxData>();

export class PoFile implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const rawFile = readManagedUtf8(args.path);
    if (!rawFile) {
      return Promise.resolve(new Map());
    }
    const potFile = parsePotFile(args, rawFile);
    potCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: { potFile, rawFile },
    });
    const tSet = extractPotTranslations(args, potFile);
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const sourcePot = potCache.getOldestAuxdata()?.potFile;
    let output: string;
    if (!sourcePot) {
      output = createUncachedPot(args);
    } else {
      output = createCachedPot(args, sourcePot);
    }
    writeManagedUtf8({ path: args.path, utf8: output });
    potCache.purge();
  }
}

const compileOptions = {
  foldLength: 100,
  sort: false,
};

function createCachedPot(
  args: WriteTFileArgs,
  sourcePot: GetTextTranslations
): string {
  updatePotTranslations(args, sourcePot);
  const buffer = po.compile(sourcePot, compileOptions);
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
