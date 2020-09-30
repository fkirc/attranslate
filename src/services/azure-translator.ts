import fetch from "node-fetch";
import { chunk, flatten } from "lodash";

import { TranslationService, TResult, TString } from "./service-definitions";
import {
  Matcher,
  reInsertInterpolations,
  replaceInterpolations,
} from "../matchers/matcher-definitions";

interface TranslationResponse {
  translations: [
    {
      text: string;
      to: string;
    }
  ];
}

const TRANSLATE_ENDPOINT =
  "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";

export class AzureTranslator implements TranslationService {
  public name = "Azure";
  private apiKey: string | undefined;
  private interpolationMatcher: Matcher | undefined;

  // eslint-disable-next-line require-await
  async initialize(apiKey?: string, interpolationMatcher?: Matcher) {
    if (!apiKey) throw new Error(`Please provide an API key for Azure.`);

    this.apiKey = apiKey;
    this.interpolationMatcher = interpolationMatcher;
  }

  async translateBatch(batch: TString[], from: string, to: string) {
    const toTranslate = batch.map(({ key, value }) => {
      const { clean, replacements } = replaceInterpolations(
        value,
        this.interpolationMatcher
      );

      return { key, value, clean, replacements };
    });

    const response = await fetch(
      `${TRANSLATE_ENDPOINT}&from=${from}&to=${to}&textType=html`,
      {
        method: "POST",
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          "Ocp-Apim-Subscription-Key": this.apiKey!,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(toTranslate.map((c) => ({ Text: c.clean }))),
      }
    );

    if (!response.ok) {
      throw new Error("Azure Translation failed: " + (await response.text()));
    }

    const data = (await response.json()) as TranslationResponse[];

    return data.map((res, i) => ({
      key: toTranslate[i].key,
      value: toTranslate[i].value,
      translated: reInsertInterpolations(
        res.translations[0].text,
        toTranslate[i].replacements
      ),
    }));
  }

  async translateStrings(
    strings: TString[],
    from: string,
    to: string
  ): Promise<TResult[]> {
    const batches = chunk(strings, 50);

    const results = await Promise.all(
      batches.map((batch) => this.translateBatch(batch, from, to))
    );

    return flatten(results);
  }
}
