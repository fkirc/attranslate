import { CoreArgs, CoreResults, TSet } from "./core-definitions";
import { logFatal } from "../util/util";
import {
  instantiateTFileFormat,
  ReadTFileArgs,
  TFileType,
  WriteTFileArgs,
} from "../file-formats/file-format-definitions";

export function logCoreResults(args: CoreArgs, results: CoreResults) {
  const changeSet = results.changeSet;
  const countAdded: number = changeSet.added.size;
  if (countAdded) {
    console.info(`Add ${countAdded} new translations`);
  }
  const countUpdated: number = changeSet.updated.size;
  if (countUpdated) {
    console.info(`Update ${countUpdated} existing translations`);
  }
  const countDeleted: number = changeSet.deleted?.size ?? 0;
  if (countDeleted) {
    console.info(`Delete ${countDeleted} stale translations`);
  }
  const countSkipped: number = changeSet.skipped.size;
  if (countSkipped) {
    console.info(`Warning: Skipped ${countSkipped} translations`);
  }
}

export async function writeTFileCore(args: WriteTFileArgs) {
  args.tSet.forEach((value, key) => {
    if (value === null) {
      args.tSet.set(key, "");
    }
  });
  const module = await instantiateTFileFormat(args.format);
  module.writeTFile(args);
}

export async function readTFileCore(
  fileFormat: TFileType,
  args: ReadTFileArgs
): Promise<TSet> {
  const module = await instantiateTFileFormat(fileFormat);
  const rawTSet = await module.readTFile(args);

  const tSet: TSet = new Map();
  const keyRegExp = new RegExp(args.keySearch, "g");
  rawTSet.forEach((value, key) => {
    const replacedKey = key.replace(keyRegExp, args.keyReplace);
    tSet.set(replacedKey, value);
  });
  return tSet;
}

export function insertAt<T>(array: T[], index: number, ...elementsArray: T[]) {
  if (index >= array.length) {
    array.push(...elementsArray);
  } else {
    array.splice(index, 0, ...elementsArray);
  }
}

export function getElementPosition(args: {
  array: string[];
  element: string;
}): number {
  for (let idx = 0; idx < args.array.length; idx++) {
    if (args.array[idx] === args.element) {
      return idx;
    }
  }
  logFatal(`Did not find element ${args.element} in ${args.array}`);
}
