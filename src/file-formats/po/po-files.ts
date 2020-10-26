import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File, writeUf8File } from "../../util/util";
import { GetTextTranslations, po } from "gettext-parser";
import { FormatCache } from "../common/format-cache";
import { longestLineLen, poParse, PoParseContext } from "./po-parse";

interface PotAuxData {
  potFile: GetTextTranslations;
  rawFile: string;
}
const potCache = new FormatCache<unknown, PotAuxData>();

export class PoFile implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const rawFile = readUtf8File(args.path);
    const context: PoParseContext = {
      args,
      raw: rawFile,
    };
    const { tSet, potFile } = poParse(context);
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
      throw Error("uncached pot not implemented");
    } else {
      output = writeCachedPot(auxData);
    }
    writeUf8File(args.path, output);
    potCache.purge();
  }
}

function writeCachedPot(auxData: PotAuxData): string {
  const lineLen = longestLineLen(auxData.rawFile);
  const options = {
    foldLength: lineLen,
    sort: false,
  };
  const buffer = po.compile(auxData.potFile, options);
  return buffer.toString("utf-8");
}
