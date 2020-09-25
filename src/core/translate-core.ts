import { TSet } from "./core-definitions";
import { serviceMap } from "../services";
import { matcherMap } from "../matchers";

export interface CoreArgs {
  source: TSet;
  sourceCache: TSet | null;
  oldTarget: TSet | null;
  sourceLng: string;
  targetLng: string;
  serviceConfig: string;
}

export interface CoreResults {
  newTarget: TSet | null;
  newSourceCache: TSet | null;
}

export async function translateCore(args: CoreArgs): Promise<CoreResults> {
  const service: keyof typeof serviceMap = "google-translate"; // TODO: Config
  if (typeof serviceMap[service] === "undefined") {
    throw new Error(`The service ${service} doesn't exist.`);
  }
  const translationService = serviceMap[service];

  const matcher: keyof typeof matcherMap = "icu"; // TODO: Config
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`The matcher ${matcher} doesn't exist.`);
  }
  const matcherInstance = matcherMap[matcher];

  console.log(`Initializing ${translationService.name}...`);
  await translationService.initialize(args.serviceConfig, matcherInstance);

  if (!translationService.supportsLanguage(args.sourceLng)) {
    throw new Error(
      `${translationService.name} doesn't support the source language ${args.sourceLng}`
    );
  }
  console.log(
    `Translating strings from '${args.sourceLng}' to '${args.targetLng}'...`
  );
  const translatedStrings = await translationService.translateStrings(
    args.source.translations,
    args.sourceLng,
    args.targetLng
  );

  return {
    newTarget: {
      translations: translatedStrings,
    },
    newSourceCache: args.sourceCache,
  };
}
