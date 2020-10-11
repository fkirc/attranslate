import { Matcher } from "../matchers/matcher-definitions";

export interface TResult {
  key: string;
  translated: string;
}

export interface TString {
  key: string;
  value: string;
}

export interface TServiceArgs {
  strings: TString[];
  srcLng: string;
  targetLng: string;
  serviceConfig: string;
  interpolationMatcher?: Matcher;
}

export interface TService {
  translateStrings: (args: TServiceArgs) => Promise<TResult[]>;
}

export const serviceMap = {
  "google-translate": null,
  deepl: null,
  azure: null,
  manual: null,
};

export function injectFakeService(serviceName: string, service: TService) {
  fakeServiceMap[serviceName] = service;
}

const fakeServiceMap: Record<string, TService> = {};

export function instantiateTService(
  service: keyof typeof serviceMap
): TService {
  const fakeService = fakeServiceMap[service];
  if (fakeService) {
    return fakeService;
  }
  /**
   * For performance reasons, we require services dynamically instead of using static imports.
   */
  switch (service) {
    case "azure":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return new (require("./azure-translator").AzureTranslator)();
    case "deepl":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return new (require("./deepl").DeepL)();
    case "google-translate":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return new (require("./google-translate").GoogleTranslate)();
    case "manual":
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return new (require("./manual").ManualTranslation)();
  }
}
