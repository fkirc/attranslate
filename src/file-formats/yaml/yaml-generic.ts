import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File, writeUf8File } from "../../util/util";
import { Options, parse, stringify } from "yaml";

export class YamlGeneric implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const ymlString = readUtf8File(args.path);
    const options: Options = {
      keepCstNodes: true,
      keepNodeTypes: true,
      prettyErrors: true,
    };
    const tSet: TSet = new Map();
    const obj: Record<string, unknown> = parse(ymlString, options);
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "string") {
        tSet.set(key, value);
      }
    }
    console.log(obj);
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const options: Options = {
      mapAsMap: true,
    };
    const ymlString = stringify(args.tSet, options);
    writeUf8File(args.path, ymlString);
  }
}
