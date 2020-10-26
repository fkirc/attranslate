import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File } from "../../util/util";
import { GetTextTranslations } from "gettext-parser";
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
    const { tSet, getTextFile } = poParse(context);
    potCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: getTextFile,
    });
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    throw Error("not implemented");
  }
}
