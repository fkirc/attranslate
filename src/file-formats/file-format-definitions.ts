import { TSet } from "../core/core-definitions";

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
   * To improve the launch-performance, we import file-formats dynamically.
   */
  switch (fileFormat) {
    case "flat-json":
      return new (await import("./flat-json")).FlatJson();
    case "nested-json":
      return new (await import("./nested-json")).NestedJson();
    case "android-xml":
      return new (await import("./android-xml")).AndroidXml();
  }
}
