import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath } from "../../util/util";
import { FormatCache } from "../common/format-cache";
import { readManagedJson, writeManagedJson } from "../common/managed-json";

const attributeCache = new FormatCache<unknown, Record<string, unknown>>();

export class FlutterArb implements TFileFormat {
  readTFile(args: ReadTFileArgs): TSet {
    const json = readManagedJson(args.path);
    const tMap = new Map<string, string>();
    const globalAttributes: Record<string, unknown> = {};
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (key.startsWith("@@")) {
        globalAttributes[key] = value;
      } else if (key.startsWith("@")) {
        attributeCache.insert({ path: args.path, key, entry: value });
      } else if (typeof value === "string") {
        tMap.set(key, value);
      } else {
        console.info(
          `Warning: '${key}-${value}' in ${getDebugPath(
            args.path
          )} is unexpected`
        );
      }
    }
    const fileCache = attributeCache.findFileCache(args.path);
    if (fileCache) {
      fileCache.auxData = globalAttributes;
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
    const globalAttributes = attributeCache.lookupAuxdata({ path: args.path });
    const mergedJson = {
      ...globalAttributes,
      ...json,
    };
    writeManagedJson({ path: args.path, object: mergedJson });
  }
}
