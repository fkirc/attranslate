import { TSet } from "../core/core-definitions";
import { FlatJson } from "./flat-json";
import { NestedJson } from "./nested-json";

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
  "flat-json": null,
  "nested-json": null,
  "android-xml": null,
};

export async function instantiateFileFormat(
  fileFormat: keyof typeof fileFormatMap
): Promise<TFileFormat> {
  /**
   * To improve launch-performance, we import file-formats dynamically.
   */
  switch (fileFormat) {
    case "flat-json":
      return new FlatJson();
    case "nested-json":
      return new NestedJson();
    case "android-xml":
      return new (await import("./android-xml")).AndroidXml();
  }
}
