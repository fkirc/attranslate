import { TSet } from "../../core/core-definitions";
import { readJsonFile, writeJsonFile } from "../../util/util";
import { flatten, unflatten } from "../../util/flatten";
import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { writeJsonProp, readJsonProp } from "../common/json-common";

export class NestedJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const nestedJson = readJsonFile(args.path);
    const flatJson: Record<string, string> = flatten(nestedJson);
    const tMap = new Map<string, string>();
    Object.keys(flatJson).forEach((key) => {
      readJsonProp(key, flatJson[key], tMap, args);
    });
    return tMap;
  }

  writeTFile(args: WriteTFileArgs): void {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      writeJsonProp(flatJson, key, value, args);
    });
    const nestedJson = unflatten(flatJson);
    writeJsonFile(args.path, nestedJson);
  }
}
