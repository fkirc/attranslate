import { Matcher, matcherMap } from "../matchers/matcher-definitions";
import { serviceMap, TService } from "../services/service-definitions";
import { CoreArgs, CoreResults, TSet } from "./core-definitions";
import { logFatal } from "../util/util";
import {
  fileFormatMap,
  ReadTFileArgs,
  WriteTFileArgs,
} from "../file-formats/file-format-definitions";

export function logCoreResults(args: CoreArgs, results: CoreResults) {
  if (!args.srcCache) {
    console.info(
      `Cache not found -> Generate a new cache to enable selective translations.\n` +
        `To make selective translations, do one of the following:\n` +
        `Option 1: Change your source-file and then re-run this tool.\n` +
        `Option 2: Delete parts of your target-file and then re-run this tool.`
    );
  }
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
  if (!results.serviceInvocation) {
    if (!args.srcCache) {
      console.info(
        `Skipped translations because we had to generate a new cache.`
      );
    } else if (!countAdded && !countUpdated && !countSkipped && !countDeleted) {
      console.info(`Target is up-to-date.`);
    }
  }
}

export function writeTFileCore(
  fileFormat: keyof typeof fileFormatMap,
  args: WriteTFileArgs
) {
  args.tSet.forEach((value, key) => {
    if (value === null) {
      args.tSet.set(key, "");
    }
  });
  fileFormatMap[fileFormat].writeTFile(args);
}

export function readTFileCore(
  fileFormat: keyof typeof fileFormatMap,
  args: ReadTFileArgs
): TSet {
  const rawTSet = fileFormatMap[fileFormat].readTFile(args);
  rawTSet.forEach((value, key) => {
    if (value === "") {
      /**
       * Empty JavaScript-strings evaluate to false, which is a serious source of bugs throughout this codebase.
       * To mitigate such bugs, we eliminate empty strings as early as possible.
       */
      rawTSet.set(key, null);
    }
  });
  return rawTSet;
}

export function getMatcherInstance(args: CoreArgs): Matcher {
  const matcher: keyof typeof matcherMap = args.matcher;
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }
  return matcherMap[matcher];
}

export function getServiceInstance(args: CoreArgs): TService {
  const service: keyof typeof serviceMap = args.service;
  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }
  return serviceMap[service];
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
