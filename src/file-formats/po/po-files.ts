import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File, writeUf8File } from "../../util/util";
import { GetTextTranslations, po } from "gettext-parser";
import { FormatCache } from "../common/format-cache";
import { poParse, PoParseContext } from "./po-parse";

const potCache = new FormatCache<unknown, GetTextTranslations>();

export class PoFile implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const raw = readUtf8File(args.path);
    const context: PoParseContext = {
      args,
      raw,
    };
    const { tSet, potFile } = poParse(context);
    potCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: potFile,
    });
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const cachedPot = potCache.getOldestAuxdata();
    let output: string;
    if (!cachedPot) {
      throw Error("uncached pot not implemented");
    } else {
      output = writeCachedPot(cachedPot);
    }
    writeUf8File(args.path, output);
  }
}

function writeCachedPot(cachedPot: GetTextTranslations): string {
  const options = {
    foldLength: false,
    sort: false,
  };
  const buffer = po.compile(cachedPot, options);
  return buffer.toString("utf-8");
}
