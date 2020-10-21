import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { parseiOSFile } from "./ios-read";
import { writeiOSFile } from "./ios-write";
import { FileCache, FormatCache } from "../common/format-cache";

export type iOSFile = FileCache<LineChunk, string[]>;

export interface LineChunk {
  value: string | null;
  lines: string[];
}

const iOSCache = new FormatCache<LineChunk, string[]>();

export class IosStrings implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const iosFile = parseiOSFile(args);
    iOSCache.insertFileCache(iosFile);
    const result: TSet = new Map();
    iosFile.entries.forEach((value, key) => {
      result.set(key, value.value);
    });
    return Promise.resolve(result);
  }

  writeTFile(args: WriteTFileArgs): void {
    writeiOSFile(args, iOSCache);
  }
}
