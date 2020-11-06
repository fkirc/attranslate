import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { Document, Options, stringify, scalarOptions } from "yaml";
import { FormatCache } from "../common/format-cache";
import Parsed = Document.Parsed;
import { unflatten } from "../../util/flatten";
import { Collection, Node, Pair, Scalar, YAMLSeq } from "yaml/types";
import { extractYmlNodes, updateYmlNodes } from "./yaml-manipulation";
import { Type } from "yaml/util";
import { parseYaml } from "./yaml-parse";
import { writeManagedUtf8 } from "../common/managed-utf8";

export function isSequence(node: Collection): node is YAMLSeq {
  if (!node.type) {
    return false;
  }
  return [Type.SEQ, Type.FLOW_SEQ].includes(node.type as Type);
}

export function isCollection(node: Node | null): node is Collection {
  if (!node) {
    return false;
  }
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

export function isPair(node: Node | null): node is Pair {
  if (!node) {
    return false;
  }
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
    scalarOptions.null.nullStr = "";
  }

  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const document = parseYaml(args);
    if (!document) {
      return Promise.resolve(new Map());
    }
    documentCache.insertFileCache({
      path: args.path,
      entries: new Map(),
      auxData: document,
    });
    const tSet: TSet = extractYmlNodes(args, document);
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    const sourceYml = documentCache.getOldestAuxdata();
    let ymlString: string;
    if (sourceYml) {
      ymlString = this.createCachedYml(args, sourceYml);
    } else {
      ymlString = this.createUncachedYml(args);
    }
    writeManagedUtf8({ path: args.path, utf8: ymlString });
    documentCache.purge();
  }

  createCachedYml(args: WriteTFileArgs, sourceYml: Parsed): string {
    const oldTargetYml = documentCache.lookupSameFileAuxdata({
      path: args.path,
    });
    updateYmlNodes({ args, sourceYml, oldTargetYml });
    return sourceYml.toString();
  }

  createUncachedYml(args: WriteTFileArgs): string {
    const flatJson: Record<string, string | null> = {};
    args.tSet.forEach((value, key) => {
      flatJson[key] = value;
    });
    const nestedJson = unflatten(flatJson);
    const options: Options = {
      mapAsMap: false,
    };
    return stringify(nestedJson, options);
  }
}
