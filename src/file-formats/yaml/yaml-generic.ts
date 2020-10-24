import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";

export class YamlGeneric implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    return Promise.resolve(new Map());
  }

  writeTFile(args: WriteTFileArgs): void {
    throw Error("not implemented");
  }
}
