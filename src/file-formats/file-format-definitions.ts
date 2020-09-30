import { TSet } from "../core/core-definitions";
import { NestedJson } from "./nested-json";
import { FlatJson } from "./flat-json";

export interface TFileFormat {
  writeTFile: (path: string, tSet: TSet) => void;
  readTFile: (path: string, lng: string) => TSet;
}

export const fileFormatMap = {
  "flat-json": new FlatJson(),
  "nested-json": new NestedJson(),
};
