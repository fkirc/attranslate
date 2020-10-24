import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logFatal, readUtf8File, writeUf8File } from "../../util/util";
import {
  Document,
  Options,
  parseDocument,
  stringify,
  scalarOptions,
} from "yaml";
import { FormatCache } from "../common/format-cache";
import Parsed = Document.Parsed;
import { flatten, unflatten } from "../../util/flatten";
import { readJsonProp, writeJsonProp } from "../common/json-common";
import { Pair, Scalar, YAMLMap } from "yaml/types";

interface YmlWriteContext {
  args: WriteTFileArgs;
  doc: Parsed;
  currentPairs: Array<Pair>;
  currentJson: Record<string, unknown>;
}

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
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      writeJsonProp(flatJson, key, value, args);
    });
    const nestedJson = unflatten(flatJson);
    const doc = documentCache.lookupAuxdata({ path: args.path });
    let ymlString: string;
    if (doc) {
      ymlString = this.createCachedYml(args, doc, nestedJson);
    } else {
      ymlString = this.createUncachedYml(args, nestedJson);
    }
    writeUf8File(args.path, ymlString);
  }

  createCachedYml(
    args: WriteTFileArgs,
    doc: Parsed,
    nestedJson: Record<string, unknown>
  ): string {
    if (!doc.contents) {
      logFatal("no cached yml contents");
    }
    const contents: Partial<YAMLMap> = doc.contents as Partial<YAMLMap>;
    if (!contents.items || !Array.isArray(contents.items)) {
      logFatal("no cached yml items");
    }
    const writeContext: YmlWriteContext = {
      args,
      doc,
      currentPairs: contents.items,
      currentJson: nestedJson,
    };
    this.recursiveReplace(writeContext);
    return doc.toString();
  }

  recursiveReplace(writeContext: YmlWriteContext) {
    writeContext.currentPairs.forEach((pair) => {
      const childJson = writeContext.currentJson[pair.key?.value];
      if (childJson === undefined) {
        return;
      }
      const value: YAMLMap | Scalar = pair.value;
      if (
        value.type === "MAP" ||
        (value.type === "FLOW_MAP" && typeof childJson === "object")
      ) {
        const childContext: YmlWriteContext = {
          ...writeContext,
          currentJson: childJson as Record<string, unknown>,
          currentPairs: pair.value.items,
        };
        this.recursiveReplace(childContext);
      } else if (typeof childJson === "string" || childJson === null) {
        (value as Scalar).value = childJson ?? "";
      }
    });
    console.log(writeContext);
  }

  createUncachedYml(
    args: WriteTFileArgs,
    nestedJson: Record<string, unknown>
  ): string {
    const options: Options = {
      mapAsMap: false,
    };
    return stringify(nestedJson, options);
  }
}
