import { TSet } from "../../core/core-definitions";
import { unflatten } from "../../util/flatten";
import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { readManagedJson, writeManagedJson } from "../common/managed-json";
import { FormatCache } from "../common/format-cache";

const jsonCache = new FormatCache<unknown, Record<string, unknown>>();

export class NestedJson implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const tMap = new Map<string, string>();
    const json = readManagedJson(args.path);
    traverseJson("", json, (entry) => {
      tMap.set(entry[0], entry[1]);
      return null;
    });
    jsonCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: json,
    });
    return Promise.resolve(tMap);
  }

  writeTFile(args: WriteTFileArgs): void {
    const sourceJson = jsonCache.getOldestAuxdata();
    let json: Record<string, unknown>;
    if (sourceJson) {
      json = sourceJson;
      replaceTranslatableProperties(args, json);
    } else {
      json = constructNestedJsonFromFlatMap(args);
    }
    writeManagedJson({ path: args.path, object: json });
  }
}

function traverseJson(
  path: string,
  node: Record<string, unknown>,
  operation: (entry: [string, string]) => string | null
) {
  for (const key of Object.keys(node)) {
    const value: unknown = node[key];
    const newPath = path ? path + "." + key : key;
    if (value && typeof value === "string") {
      const newValue = operation([newPath, value]);
      if (newValue) {
        node[key] = newValue;
      }
    } else if (value && typeof value === "object") {
      traverseJson(newPath, value as Record<string, unknown>, operation);
    }
  }
}

function replaceTranslatableProperties(
  args: WriteTFileArgs,
  json: Record<string, unknown>
) {
  traverseJson("", json, (entry) => {
    const path = entry[0];
    return args.tSet.get(path) ?? null;
  });
}

function constructNestedJsonFromFlatMap(
  args: WriteTFileArgs
): Record<string, unknown> {
  const flatJson: Record<string, string | null> = {};
  args.tSet.forEach((value, key) => {
    flatJson[key] = value;
  });
  return unflatten(flatJson);
}
