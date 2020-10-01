import { GoogleTranslate } from "./google-translate";
import { DeepL } from "./deepl";
import { AzureTranslator } from "./azure-translator";
import { ManualTranslation } from "./manual";
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
  "google-translate": new GoogleTranslate(),
  deepl: new DeepL(),
  azure: new AzureTranslator(),
  manual: new ManualTranslation(),
};
