import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { writeJsonProp, readJsonProp } from "../common/json-common";
import { readManagedJson, writeManagedJson } from "../common/managed-json";

export class FlatJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const json = readManagedJson(args.path);
    const tMap = new Map<string, string>();
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (typeof value !== "string" && value !== null) {
        logParseError(`Property '${key}' is not a string or null`, args);
      }
      readJsonProp(key, value, tMap, args);
    }
    return tMap;
  }

  writeTFile(args: WriteTFileArgs): void {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      writeJsonProp(flatJson, key, value, args);
    });
    writeManagedJson({ path: args.path, object: flatJson });
  }
}
