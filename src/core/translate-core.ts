import {
  CoreArgs,
  CoreResults,
  TChangeSet,
  TServiceInvocation,
  TSet,
} from "./core-definitions";
import {
  leftJoin,
  leftJoinPreserveOldTargetOrder,
  leftMinusRight,
  leftMinusRightFillNull,
  selectLeftDistinct,
} from "./tset-ops";
import {
  convertFromServiceResults,
  convertToTStringList,
  getMatcherInstance,
  getServiceInstance,
  logCoreResults,
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
  if (!src.size) {
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
  serviceInputs: TSet,
  args: CoreArgs
): Promise<TServiceInvocation> {
  const rawInputs = convertToTStringList(serviceInputs);
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
    srcLng: args.srcLng,
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
  return {
    inputs: serviceInputs,
    results: convertFromServiceResults(results),
  };
}

function extractStaleTranslations(args: CoreArgs): TSet | null {
  if (args.oldTarget) {
    return leftMinusRight(args.oldTarget, args.src);
  } else {
    return null;
  }
}

function computeChangeSet(
  args: CoreArgs,
  serviceInvocation: TServiceInvocation | null
): TChangeSet {
  const removed = extractStaleTranslations(args);
  if (!serviceInvocation) {
    return {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      removed,
    };
  }
  const skipped = selectLeftDistinct(
    serviceInvocation.inputs,
    serviceInvocation.results,
    "COMPARE_KEYS"
  );
  if (!args.oldTarget) {
    return {
      added: serviceInvocation.results,
      updated: new Map(),
      skipped,
      removed,
    };
  }
  const added = selectLeftDistinct(
    serviceInvocation.results,
    args.oldTarget,
    "COMPARE_KEYS"
  );
  const updated = selectLeftDistinct(
    serviceInvocation.results,
    args.oldTarget,
    "COMPARE_VALUES"
  );
  return {
    added,
    updated,
    skipped,
    removed,
  };
}

function computeNewTarget(
  args: CoreArgs,
  changeSet: TChangeSet,
  serviceInvocation: TServiceInvocation | null
): TSet {
  const oldTargetRef: TSet | null =
    args.oldTarget && changeSet.removed
      ? leftMinusRight(args.oldTarget, changeSet.removed)
      : args.oldTarget;

  if (!serviceInvocation) {
    return oldTargetRef ?? new Map<string, string | null>();
  }
  if (!oldTargetRef) {
    return serviceInvocation.results;
  }
  return leftJoinPreserveOldTargetOrder({
    translateResults: serviceInvocation.results,
    oldTarget: oldTargetRef,
    src: args.src,
  });
}

function computeNewSrcCache(args: CoreArgs, changeSet: TChangeSet) {
  if (changeSet.skipped.size) {
    return leftMinusRightFillNull(args.src, changeSet.skipped);
  } else {
    return args.src;
  }
}

function computeCoreResults(
  args: CoreArgs,
  serviceInvocation: TServiceInvocation | null,
  changeSet: TChangeSet
): CoreResults {
  return {
    changeSet,
    serviceInvocation,
    newTarget: computeNewTarget(args, changeSet, serviceInvocation),
    newSrcCache: computeNewSrcCache(args, changeSet),
  };
}

export async function translateCore(args: CoreArgs): Promise<CoreResults> {
  const serviceInputs = extractStringsToTranslate(args);
  let serviceInvocation: TServiceInvocation | null = null;
  if (serviceInputs.size >= 1) {
    serviceInvocation = await invokeTranslationService(serviceInputs, args);
  }
  const changeSet = computeChangeSet(args, serviceInvocation);
  const results = computeCoreResults(args, serviceInvocation, changeSet);
  logCoreResults(args, results);
  return results;
}
