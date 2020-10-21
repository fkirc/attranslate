import { TSet } from "../../core/core-definitions";
import { flatten, unflatten } from "../../util/flatten";
import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { writeJsonProp, readJsonProp } from "../common/json-common";
import { readManagedJson, writeManagedJson } from "../common/managed-json";

export class NestedJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const nestedJson = readManagedJson(args.path);
    const flatJson: Record<string, string> = flatten(nestedJson);
    const tMap = new Map<string, string>();
    Object.keys(flatJson).forEach((key) => {
      readJsonProp(key, flatJson[key], tMap, args);
    });
    return Promise.resolve(tMap);
  }

  writeTFile(args: WriteTFileArgs): void {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      writeJsonProp(flatJson, key, value, args);
    });
    const nestedJson = unflatten(flatJson);
    writeManagedJson({ path: args.path, object: nestedJson });
  }
}
