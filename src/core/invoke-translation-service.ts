import { CoreArgs, TServiceInvocation, TSet } from "./core-definitions";
import { getMatcherInstance, getServiceInstance } from "./core-util";
import {
  reInsertInterpolations,
  replaceInterpolations,
  Replacer,
} from "../matchers/matcher-definitions";
import {
  TResult,
  TServiceArgs,
  TString,
} from "../services/service-definitions";

export async function invokeTranslationService(
  serviceInputs: TSet,
  args: CoreArgs
): Promise<TServiceInvocation> {
  /**
   * Some translation services throw errors if they see empty strings.
   * Therefore, we bypass empty strings without changing them.
   */
  const rawInputs: TString[] = [];
  const results: TSet = new Map();
  serviceInputs.forEach((value, key) => {
    if (!value || !value.trim().length) {
      results.set(key, value);
    } else {
      rawInputs.push({
        key,
        value,
      });
    }
  });
  if (results.size) {
    console.info(`Bypass ${results.size} strings because they are empty...`);
  }
  let translateResults: TResult[] = [];
  if (rawInputs.length) {
    translateResults = await runTranslationService(rawInputs, args);
  }
  translateResults.forEach((tResult) => {
    results.set(tResult.key, tResult.translated);
  });
  return {
    inputs: serviceInputs,
    results,
  };
}

async function runTranslationService(
  rawInputs: TString[],
  args: CoreArgs
): Promise<TResult[]> {
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
  console.info(
    `Received ${rawResults.length} results from '${args.service}'...`
  );
  return rawResults.map((rawResult) => {
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
}
