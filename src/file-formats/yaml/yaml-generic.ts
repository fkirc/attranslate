import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File, writeUf8File } from "../../util/util";
import {
  Document,
  Options,
  parseDocument,
  stringify,
  scalarOptions,
} from "yaml";
import { FormatCache } from "../common/format-cache";
import Parsed = Document.Parsed;
import { flatten } from "../../util/flatten";
import { readJsonProp } from "../common/json-common";

const documentCache = new FormatCache<unknown, Parsed>();

export class YamlGeneric implements TFileFormat {
  constructor() {
    // Do not mess with user's line breaks; preserve everything as is!
    scalarOptions.str.fold = { lineWidth: 0, minContentWidth: 0 };
    scalarOptions.str.doubleQuoted = {
      minMultiLineLength: 1000,
      jsonEncoding: false,
    };
  }

  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const ymlString = readUtf8File(args.path);
    const options: Options = {
      keepCstNodes: true,
      keepNodeTypes: true,
      keepUndefined: true,
      prettyErrors: true,
    };
    const document: Parsed = parseDocument(ymlString, options);
    documentCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: document,
    });
    const nestedJson = document.toJSON();
    const flatJson: Record<string, string> = flatten(nestedJson);
    const tSet: TSet = new Map();
    Object.keys(flatJson).forEach((key) => {
      readJsonProp(key, flatJson[key], tSet, args);
    });
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const doc = documentCache.lookupAuxdata({ path: args.path });
    let ymlString: string;
    if (doc) {
      ymlString = this.createCachedYml(args, doc);
    } else {
      ymlString = this.createUncachedYml(args);
    }
    writeUf8File(args.path, ymlString);
  }

  createCachedYml(args: WriteTFileArgs, doc: Parsed): string {
    return doc.toString();
  }

  createUncachedYml(args: WriteTFileArgs): string {
    const options: Options = {
      mapAsMap: true,
    };
    return stringify(args.tSet, options);
  }
}
