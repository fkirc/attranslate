import fetch from "node-fetch";
import { chunk, flatten } from "lodash";

import {
  TService,
  TResult,
  TString,
  TServiceArgs,
} from "./service-definitions";
import { logFatal } from "../util/util";

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
  async translateBatch(
    batch: TString[],
    args: TServiceArgs,
    apiKey: string
  ): Promise<TResult[]> {
    const azureBody: { Text: string }[] = batch.map((tString) => {
      return {
        Text: tString.value,
      };
    });
    const response = await fetch(
      `${TRANSLATE_ENDPOINT}&from=${args.srcLng}&to=${args.targetLng}&textType=html`,
      {
        method: "POST",
        headers: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          "Ocp-Apim-Subscription-Key": apiKey,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(azureBody),
      }
    );
    if (!response.ok) {
      throw new Error("Azure Translation failed: " + (await response.text()));
    }

    const data = (await response.json()) as TranslationResponse[];
    return data.map((res, i) => ({
      key: batch[i].key,
      translated: res.translations[i].text,
    }));
  }

  async translateStrings(args: TServiceArgs): Promise<TResult[]> {
    const apiKey = args.serviceConfig;
    if (!apiKey) {
      logFatal("Set '--serviceConfig' to an Azure API key");
    }
    const batches = chunk(args.strings, 50);
    const results = await Promise.all(
      batches.map((batch) => this.translateBatch(batch, args, apiKey))
    );
    return flatten(results);
  }
}
