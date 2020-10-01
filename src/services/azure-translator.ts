import fetch from "node-fetch";
import { chunk, flatten } from "lodash";

import {
  TService,
  TResult,
  TString,
  TServiceArgs,
} from "./service-definitions";
import {
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

export class AzureTranslator implements TService {
  async translateBatch(batch: TString[], args: TServiceArgs) {
    const toTranslate = batch.map(({ key, value }) => {
      const { clean, replacements } = replaceInterpolations(
        value,
        args.interpolationMatcher
      );

      return { key, value, clean, replacements };
    });

    const response = await fetch(
      `${TRANSLATE_ENDPOINT}&from=${args.srcLng}&to=${args.targetLng}&textType=html`,
      {
        method: "POST",
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          "Ocp-Apim-Subscription-Key": args.serviceConfig,
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

  async translateStrings(args: TServiceArgs): Promise<TResult[]> {
    const batches = chunk(args.strings, 50);

    const results = await Promise.all(
      batches.map((batch) => this.translateBatch(batch, args))
    );
    return flatten(results);
  }
}
