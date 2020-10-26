import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logFatal, writeUtf8File } from "../../util/util";
import { Document, Options, stringify, scalarOptions } from "yaml";
import { FormatCache } from "../common/format-cache";
import Parsed = Document.Parsed;
import { flatten, unflatten } from "../../util/flatten";
import { readJsonProp } from "../common/json-common";
import { Collection, Node, Pair, Scalar, YAMLSeq } from "yaml/types";
import { recursiveNodeUpdate } from "./yaml-manipulation";
import { Type } from "yaml/util";
import { parseYaml } from "./yaml-parse";

export interface YmlWriteContext {
  args: WriteTFileArgs;
  doc: Parsed;
  partialKey: string;
  currentNode: Node;
}

export function isSequence(node: Collection): node is YAMLSeq {
  if (!node.type) {
    return false;
  }
  return [Type.SEQ, Type.FLOW_SEQ].includes(node.type as Type);
}

export function isCollection(node: Node): node is Collection {
  if (!node.type) {
    return false;
  }
  return [
    Type.MAP,
    Type.FLOW_MAP,
    Type.SEQ,
    Type.FLOW_SEQ,
    Type.DOCUMENT,
  ].includes(node.type as Type);
}

export function isPair(node: Node): node is Pair {
  if (!node.type) {
    return false;
  }
  return [Pair.Type.PAIR, Pair.Type.MERGE_PAIR].includes(
    node.type as Pair.Type
  );
}

export function isScalar(node: Node): node is Scalar {
  if (!node.type) {
    return false;
  }
  return [
    Type.BLOCK_FOLDED,
    Type.BLOCK_LITERAL,
    Type.PLAIN,
    Type.QUOTE_DOUBLE,
    Type.QUOTE_SINGLE,
  ].includes(node.type as Type);
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
    const document = parseYaml(args);
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
      flatJson[key] = value;
    });
    const nestedJson = unflatten(flatJson);
    const cachedYml = documentCache.getOldestAuxdata();
    let ymlString: string;
    if (cachedYml) {
      ymlString = this.createCachedYml(args, cachedYml, nestedJson);
    } else {
      ymlString = this.createUncachedYml(args, nestedJson);
    }
    documentCache.purge();
    writeUtf8File(args.path, ymlString);
  }

  createCachedYml(
    args: WriteTFileArgs,
    cachedYml: Parsed,
    nestedJson: Record<string, unknown>
  ): string {
    if (!cachedYml.contents) {
      logFatal("no cached yml contents");
    }
    const contents: Partial<Collection> = cachedYml.contents as Partial<
      Collection
    >;
    if (!contents.items || !Array.isArray(contents.items)) {
      logFatal("no cached yml items");
    }
    const writeContext: YmlWriteContext = {
      args,
      doc: cachedYml,
      partialKey: "",
      currentNode: contents as Collection,
    };
    recursiveNodeUpdate(writeContext);
    return cachedYml.toString();
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
