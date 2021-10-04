import {
  CoreArgs,
  CoreResults,
  TChangeSet,
  TServiceInvocation,
  TSet,
} from "./core-definitions";
import {
  leftMerge,
  joinResultsPreserveOrder,
  leftMinusRight,
  leftMinusRightFillNull,
  selectLeftDistinct,
} from "./tset-ops";
import { logCoreResults } from "./core-util";
import { logFatal } from "../util/util";
import { invokeTranslationService } from "./invoke-translation-service";

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
      return selectLeftDistinct(src, oldTarget, "COMPARE_KEYS_AND_NULL_VALUES");
    } else {
      // Translate values that are either different to the cache or missing in the target.
      const cacheDiffs = selectLeftDistinct(src, oldSrcCache, "COMPARE_VALUES");
      const targetMisses = selectLeftDistinct(
        src,
        oldTarget,
        "COMPARE_KEYS_AND_NULL_VALUES"
      );
      leftMerge(cacheDiffs, targetMisses);
      return cacheDiffs;
    }
  }
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
  const deleted = extractStaleTranslations(args);
  if (!serviceInvocation) {
    return {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      deleted,
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
      deleted,
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
    deleted,
  };
}

function computeNewTarget(
  args: CoreArgs,
  changeSet: TChangeSet,
  serviceInvocation: TServiceInvocation | null
): TSet {
  const oldTargetRef: TSet | null =
    args.oldTarget && changeSet.deleted
      ? leftMinusRight(args.oldTarget, changeSet.deleted)
      : args.oldTarget;

  if (!serviceInvocation) {
    return oldTargetRef ?? new Map<string, string | null>();
  }
  if (!oldTargetRef) {
    return serviceInvocation.results;
  }
  return joinResultsPreserveOrder({
    translateResults: serviceInvocation.results,
    changeSet,
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
