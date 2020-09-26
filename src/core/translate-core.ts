import { TSet } from "./core-definitions";
import { serviceMap, TString } from "../services";
import { matcherMap } from "../matchers";

export interface CoreArgs {
  src: TSet;
  oldSrcCache: TSet | null;
  oldTarget: TSet | null;
  srcLng: string;
  targetLng: string;
  service: keyof typeof serviceMap; // TODO: Type safety
  serviceConfig: string;
  matcher: keyof typeof matcherMap; // TODO: Type safety
}

export interface CoreResults {
  newTarget: TSet | null;
  newSrcCache: TSet | null;
}

export async function translateCore(args: CoreArgs): Promise<CoreResults> {
  const service: keyof typeof serviceMap = args.service;
  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }
  const translationService = serviceMap[service];

  const matcher: keyof typeof matcherMap = args.matcher;
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }
  const matcherInstance = matcherMap[matcher];

  console.log(`Initializing ${translationService.name}...`);
  await translationService.initialize(args.serviceConfig, matcherInstance);
  if (!translationService.supportsLanguage(args.srcLng)) {
    throw new Error(
      `${translationService.name} doesn't support the source language ${args.srcLng}`
    );
  }
  console.log(
    `Translating strings from '${args.srcLng}' to '${args.targetLng}'...`
  );
  const translatedStrings = await translationService.translateStrings(
    args.src.translations,
    args.srcLng,
    args.targetLng
  );

  const target: TString[] = translatedStrings.map((v) => {
    return {
      key: v.key,
      value: v.translated,
    };
  });
  return {
    newTarget: {
      translations: target,
    },
    newSrcCache: args.oldSrcCache,
  };
}
