import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { getDebugPath } from "../../util/util";
import { FormatCache } from "../common/format-cache";
import { readManagedJson, writeManagedJson } from "../common/managed-json";

type ArbAttributes = Record<string, unknown>;
interface ArbAuxData {
  globalAttributes: ArbAttributes;
}
const attributeCache = new FormatCache<ArbAttributes, ArbAuxData>();

export class FlutterArb implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const json: Record<string, unknown> = readManagedJson(args.path);
    const tMap = new Map<string, string>();
    const globalAttributes: ArbAttributes = {};
    for (const key of Object.keys(json)) {
      const value = json[key];
      if (key.startsWith("@@")) {
        globalAttributes[key] = value;
      } else if (key.startsWith("@") && value && typeof value === "object") {
        attributeCache.insert({
          path: args.path,
          key,
          entry: value as ArbAttributes,
        });
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
      fileCache.auxData = { globalAttributes };
    }
    return Promise.resolve(tMap);
  }

  writeTFile(args: WriteTFileArgs): void {
    const json: Record<string, unknown> = {};
    args.tSet.forEach((value, key) => {
      json[key] = value;
      const attributeKey = `@${key}`;
      const cachedAttributes = attributeCache.lookup({
        path: args.path,
        key: attributeKey,
      });
      if (cachedAttributes) {
        const mergedAttributes = {
          ...cachedAttributes,
        };
        json[attributeKey] = mergedAttributes;
      }
    });
    const auxData = attributeCache.lookupAuxdata({ path: args.path });
    const mergedJson = {
      ...auxData?.globalAttributes,
      ...json,
    };
    writeManagedJson({ path: args.path, object: mergedJson });
  }
}
