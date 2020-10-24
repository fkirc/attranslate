import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { readUtf8File, writeUf8File } from "../../util/util";
import { Document, Options, parse, parseDocument, stringify } from "yaml";
import { FormatCache } from "../common/format-cache";
import Parsed = Document.Parsed;

const documentCache = new FormatCache<unknown, Parsed>();

export class YamlGeneric implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const ymlString = readUtf8File(args.path);
    const options: Options = {
      keepCstNodes: true,
      keepNodeTypes: true,
      keepUndefined: true,
      prettyErrors: true,
    };
    const tSet: TSet = new Map();
    const simpleParse: Record<string, unknown> = parse(ymlString, options);
    const document: Parsed = parseDocument(ymlString, options);
    documentCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: document,
    });
    for (const key of Object.keys(simpleParse)) {
      const value = simpleParse[key];
      if (typeof value === "string") {
        tSet.set(key, value);
      }
    }
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
