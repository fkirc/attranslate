import { CoreArgs, CoreResults, TSet } from "./core-definitions";
import { leftJoin, selectLeftDistinct } from "./tset-ops";
import {
  convertFromServiceResults,
  convertToTStringList,
  getMatcherInstance,
  getServiceInstance,
} from "./core-util";
import { logFatal } from "../util/util";
import {
  TResult,
  TServiceArgs,
  TString,
} from "../services/service-definitions";
import {
  reInsertInterpolations,
  replaceInterpolations,
  Replacer,
} from "../matchers/matcher-definitions";

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

async function invokeTranslationService(
  toTranslate: TSet,
  args: CoreArgs
): Promise<TSet> {
  const rawInputs = convertToTStringList(toTranslate);
  const matcher = getMatcherInstance(args);
  const replacers = new Map<string, Replacer>();
  rawInputs.forEach((rawString) => {
    const replacer = replaceInterpolations(rawString.value, matcher);
    replacers.set(rawString.key, replacer);
  });
  const replacedInputs: TString[] = rawInputs.map((rawString) => {
    return {
      key: rawString.key,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: replacers.get(rawString.key)!.clean,
    };
  });

  const serviceArgs: TServiceArgs = {
    strings: replacedInputs,
    srcLng: args.src.lng,
    targetLng: args.targetLng,
    serviceConfig: args.serviceConfig,
    interpolationMatcher: getMatcherInstance(args),
  };
  const translationService = getServiceInstance(args);
  const rawResults = await translationService.translateStrings(serviceArgs);

  const results: TResult[] = rawResults.map((rawResult) => {
    const cleanResult = reInsertInterpolations(
      rawResult.translated,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      replacers.get(rawResult.key)!.replacements
    );
    return {
      key: rawResult.key,
      translated: cleanResult,
    };
  });
  return convertFromServiceResults(results, args.targetLng);
}

function mergeResults(
  args: CoreArgs,
  serviceResults: TSet | null
): Omit<CoreResults, "serviceResults"> {
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
      added: null,
      updated: null,
    };
  }
  if (!args.oldTarget) {
    return {
      newTarget: serviceResults,
      added: serviceResults.translations,
      updated: null,
    };
  }

  const added = selectLeftDistinct(
    serviceResults,
    args.oldTarget,
    "COMPARE_KEYS"
  ).translations;
  const updated = selectLeftDistinct(
    serviceResults,
    args.oldTarget,
    "COMPARE_VALUES"
  ).translations;
  // TODO: Delete stale keys from target?
  return {
    newTarget: leftJoin(serviceResults, args.oldTarget),
    added,
    updated,
  };
}

export async function translateCore(args: CoreArgs): Promise<CoreResults> {
  const toTranslate = extractStringsToTranslate(args);

  let serviceResults: TSet | null = null;
  if (toTranslate.translations.size >= 1) {
    serviceResults = await invokeTranslationService(toTranslate, args);
  }

  if (!args.srcCache) {
    console.info(
      `Cache not found -> Generate a new cache to enable selective translations.\n` +
        `To make selective translations, do one of the following:\n` +
        `Option 1: Change your source-file and then re-run this tool.\n` +
        `Option 2: Delete parts of your target-file and then re-run this tool.\n`
    );
  }
  const merge = mergeResults(args, serviceResults);
  const serviceT = serviceResults?.translations ?? null;
  return { ...merge, serviceResults: serviceT };
}
