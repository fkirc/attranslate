import { TSet } from "./core-definitions";
import { serviceMap } from "../services";
import { matcherMap } from "../matchers";
import {
  convertFromServiceResults,
  convertToTStringList,
  leftJoin,
  selectLeftDistinct,
} from "./tset-ops";
import { getMatcherInstance, getServiceInstance } from "./core-util";
import { logFatal } from "../util/util";

export interface CoreArgs {
  src: TSet;
  srcCache: TSet | null;
  oldTarget: TSet | null;
  targetLng: string;
  service: keyof typeof serviceMap; // TODO: Type safety
  serviceConfig: string;
  matcher: keyof typeof matcherMap; // TODO: Type safety
}

export interface CoreResults {
  newTarget: TSet;
  countNew: number;
  countUpdated: number;
}

function extractStringsToTranslate(args: CoreArgs): TSet {
  const src: TSet = args.src;
  if (!src.translations.size) {
    logFatal("Did not find any source translations");
  }
  const oldSrcCache: TSet | null = args.srcCache;
  const oldTarget: TSet | null = args.oldTarget;
  if (!oldTarget) {
    // Translate everything if an old target does not yet exist.
    return src;
  } else {
    if (!oldSrcCache) {
      // Translate values whose keys are not in the target.
      return selectLeftDistinct(src, oldTarget, "COMPARE_KEYS");
    } else {
      // Translate values that are either different to the cache or missing in the target.
      const cacheDiffs = selectLeftDistinct(src, oldSrcCache, "COMPARE_VALUES");
      const targetMisses = selectLeftDistinct(src, oldTarget, "COMPARE_KEYS");
      return leftJoin(cacheDiffs, targetMisses);
    }
  }
}

function mergeResults(
  args: CoreArgs,
  serviceResults: TSet | null
): CoreResults {
  if (!serviceResults) {
    if (!args.srcCache) {
      console.info(
        `Skipped translations because we had to generate a new cache.`
      );
    } else {
      console.info(`Nothing changed, translations are up-to-date.`);
    }
    if (!args.oldTarget) {
      logFatal("Missing both serviceResults and oldTarget");
    }
    return {
      newTarget: args.oldTarget,
      countNew: 0,
      countUpdated: 0,
    };
  }
  const serviceSize = serviceResults.translations.size;
  if (!args.oldTarget) {
    console.info(`Create a new target file with ${serviceSize} translations.`);
    return {
      newTarget: serviceResults,
      countNew: serviceSize,
      countUpdated: 0,
    };
  }
  const countNew = selectLeftDistinct(
    serviceResults,
    args.oldTarget,
    "COMPARE_KEYS"
  ).translations.size;
  if (countNew >= 1) {
    console.info(`Add ${countNew} new translations.`);
  }
  const countUpdated = selectLeftDistinct(
    serviceResults,
    args.oldTarget,
    "COMPARE_VALUES"
  ).translations.size;
  if (countUpdated >= 1) {
    console.info(`Update ${countUpdated} existing translations.`);
  }
  // TODO: Delete stale keys from target?
  return {
    newTarget: leftJoin(serviceResults, args.oldTarget),
    countNew: countNew,
    countUpdated: countUpdated,
  };
}

export async function translateCore(args: CoreArgs): Promise<CoreResults> {
  const stringsToTranslate = extractStringsToTranslate(args);

  let serviceResults: TSet | null = null;
  if (stringsToTranslate.translations.size >= 1) {
    const translationService = getServiceInstance(args);
    // TODO: Remove init from service API
    await translationService.initialize(
      args.serviceConfig,
      getMatcherInstance(args)
    );
    // TODO: Maybe add supportsLangauge check for translationService
    console.info(
      `Translating from '${args.src.lng}' to '${args.targetLng}'...`
    );
    const rawServiceResults = await translationService.translateStrings(
      convertToTStringList(stringsToTranslate),
      args.src.lng,
      args.targetLng
    );
    serviceResults = convertFromServiceResults(
      rawServiceResults,
      args.targetLng
    );
  }

  if (!args.srcCache) {
    console.info(
      `Cache not found -> Generate a new cache to enable selective translations.\n` +
        `To make selective translations, do one of the following:\n` +
        `Option 1: Change your source-file and then re-run this tool.\n` +
        `Option 2: Delete parts of your target-file and then re-run this tool.`
    );
  }
  return mergeResults(args, serviceResults);
}
