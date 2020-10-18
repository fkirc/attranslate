import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath, logFatal } from "../../util/util";
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
  readTFile(args: ReadTFileArgs): TSet {
    const iosFile = parseiOSFile(args);
    iOSCache.insertFileCache(iosFile);
    const result: TSet = new Map();
    iosFile.entries.forEach((value, key) => {
      result.set(key, value.value);
    });
    return result;
  }

  writeTFile(args: WriteTFileArgs): void {
    writeiOSFile(args, iOSCache);
  }
}

export function logiOSError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to iOS-parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}
