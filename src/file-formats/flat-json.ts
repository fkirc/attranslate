import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "./file-format-definitions";
import { TSet } from "../core/core-definitions";
import {
  getDebugPath,
  logFatal,
  readJsonFile,
  writeJsonFile,
} from "../util/util";

export class FlatJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const json = readJsonFile(args.path);
    const tMap = new Map<string, string>();
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (typeof value !== "string" && value !== null) {
        logFatal(
          `${getDebugPath(
            args.path
          )} is not a flat JSON-file - Property '${key}' is not a string or null`
        );
      }
      tMap.set(key, value);
    }
    return tMap;
  }

  writeTFile(args: WriteTFileArgs): void {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      flatJson[key] = value;
    });
    writeJsonFile(args.path, flatJson);
  }
}
