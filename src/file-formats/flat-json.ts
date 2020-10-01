import { TFileFormat } from "./file-format-definitions";
import { TSet } from "../core/core-definitions";
import {
  getDebugPath,
  logFatal,
  readJsonFile,
  writeJsonFile,
} from "../util/util";

export class FlatJson implements TFileFormat {
  readTFile(path: string, lng: string): TSet {
    const json = readJsonFile(path);
    const tMap = new Map<string, string>();
    for (const key of Object.keys(json)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const value = json[key];
      if (typeof value !== "string" && value !== null) {
        logFatal(
          `${getDebugPath(
            path
          )} is not a flat JSON-file - Property '${key}' is not a string or null`
        );
      }
      tMap.set(key, value);
    }
    return {
      translations: tMap,
      lng,
    };
  }

  writeTFile(path: string, tSet: TSet): void {
    const flatJson: Record<string, string | null> = {}; // TODO: Use type instead of record
    tSet.translations.forEach((value, key) => {
      flatJson[key] = value;
    });
    writeJsonFile(path, flatJson);
  }
}
