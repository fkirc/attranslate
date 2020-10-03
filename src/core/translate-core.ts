import {
  CoreArgs,
  CoreResults,
  TChangeSet,
  TServiceInvocation,
  TSet,
} from "./core-definitions";
import {
  leftJoin,
  leftJoinPreserveRightOrder,
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

function computeChangeSet(
  args: CoreArgs,
  serviceInvocation: TServiceInvocation | null
): TChangeSet {
  if (!serviceInvocation) {
    return {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
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
  // TODO: Delete stale keys from target, optionally
  return {
    added,
    updated,
    skipped,
  };
}

function computeNewTarget(
  args: CoreArgs,
  serviceInvocation: TServiceInvocation | null
): TSet {
  if (!serviceInvocation) {
    // TODO: Remove stale keys (optionally)
    return args.oldTarget ?? new Map<string, string | null>();
  }
  if (!args.oldTarget) {
    return serviceInvocation.results;
  }
  return leftJoinPreserveRightOrder(serviceInvocation.results, args.oldTarget);
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
    newTarget: computeNewTarget(args, serviceInvocation),
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
