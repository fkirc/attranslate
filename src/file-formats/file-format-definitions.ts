import { TSet } from "../core/core-definitions";
import { NestedJson } from "./nested-json";

export interface TFileFormat {
  writeTFile: (path: string, tSet: TSet) => void;
  readTFile: (path: string, lng: string) => TSet;
}

export const fileFormatMap = {
  "nested-json": new NestedJson(),
};
