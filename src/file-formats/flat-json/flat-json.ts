import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { readManagedJson, writeManagedJson } from "../common/managed-json";

export class FlatJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const json = readManagedJson(args.path);
    const tMap = new Map<string, string>();
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (typeof value !== "string" && value !== null) {
        logParseError(`Property '${key}' is not a string or null`, args);
      }
      tMap.set(key, value);
    }
    return Promise.resolve(tMap);
  }

  writeTFile(args: WriteTFileArgs): void {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      flatJson[key] = value;
    });
    writeManagedJson({ path: args.path, object: flatJson });
  }
}
