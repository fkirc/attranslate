import { CoreArgs, TServiceInvocation, TSet } from "./core-definitions";
import {
  convertFromServiceResults,
  convertToTStringList,
  getMatcherInstance,
  getServiceInstance,
} from "./core-util";
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
