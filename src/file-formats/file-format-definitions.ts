import { TSet } from "../core/core-definitions";
import { NestedJson } from "./nested-json";
import { FlatJson } from "./flat-json";

export interface WriteTFileArgs {
  path: string;
  tSet: TSet;
  lng: string;
}

export interface ReadTFileArgs {
  path: string;
  lng: string;
}

export interface TFileFormat {
  writeTFile: (args: WriteTFileArgs) => void;
  readTFile: (args: ReadTFileArgs) => TSet;
}

export const fileFormatMap = {
  "flat-json": new FlatJson(),
  "nested-json": new NestedJson(),
};
