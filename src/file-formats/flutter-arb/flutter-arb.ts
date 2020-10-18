import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath, readJsonFile, writeJsonFile } from "../../util/util";
import { FormatCache } from "../common/format-cache";

const attributeCache = new FormatCache<unknown, never>();

export class FlutterArb implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const json = readJsonFile(args.path);
    const tMap = new Map<string, string>();
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (key.startsWith("@")) {
        attributeCache.insert({ path: args.path, key, entry: value });
      } else if (typeof value === "string") {
        tMap.set(key, value);
      } else {
        console.info(
          `'${key}-${value}' in ${getDebugPath(
            args.path
          )} is neither a string nor does it start with "@"`
        );
      }
    }
    return tMap;
  }

  writeTFile(args: WriteTFileArgs): void {
    const json: Record<string, unknown> = {};
    args.tSet.forEach((value, key) => {
      json[key] = value;
      const attributeKey = `@${key}`;
      const attribute = attributeCache.lookup({
        path: args.path,
        key: attributeKey,
      });
      if (attribute) {
        json[attributeKey] = attribute;
      }
    });
    writeJsonFile(args.path, json);
  }
}
