import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath, logFatal } from "../../util/util";
import { parseiOSFile } from "./ios-read";
import { insertIntoiOSCache } from "./ios-cache";
import { writeiOSFile } from "./ios-write";

export interface iOSFile {
  path: string;
  chunks: Map<string, LineChunk>;
  appendix: string[];
}

export interface LineChunk {
  value: string | null;
  lines: string[];
}

export class IosStrings implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const iosFile = parseiOSFile(args);
    insertIntoiOSCache(iosFile);
    const result: TSet = new Map();
    iosFile.chunks.forEach((value, key) => {
      result.set(key, value.value);
    });
    return result;
  }

  writeTFile(args: WriteTFileArgs): void {
    writeiOSFile(args);
  }
}

export function logiOSError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to iOS-parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}
