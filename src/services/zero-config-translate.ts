import { TranslationServiceClient } from "@google-cloud/translate";
import {
  TResult,
  TService,
  TServiceArgs,
  TString,
} from "./service-definitions";
import { google } from "@google-cloud/translate/build/protos/protos";
import ITranslateTextRequest = google.cloud.translation.v3.ITranslateTextRequest;
import { ClientOptions } from "google-gax";
import ITranslation = google.cloud.translation.v3.ITranslation;
import { logFatal } from "../util/util";
import { chunk, flatten } from "lodash";
import * as v3 from "@google-cloud/translate/build/src/v3";
import fetch from "node-fetch";

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

async function fetchRemoteConfig(): Promise<ServiceAccount> {
  const zeroConfigURL =
    "https://storage.googleapis.com/zero-config/attranslate-346421-c6788e28555c.json";
  const response = await fetch(zeroConfigURL, {
    method: "GET",
  });
  return (await response.json()) as ServiceAccount;
}

export class ZeroConfigTranslate implements TService {
  async translateStrings(args: TServiceArgs) {
    const remoteConfig = await fetchRemoteConfig();

    const clientOptions: ClientOptions = {
      credentials: {
        client_email: remoteConfig.client_email,
        private_key: remoteConfig.private_key,
      },
    };
    const client = new TranslationServiceClient(clientOptions);
    const batches: TString[][] = chunk(args.strings, 10);
    const results = await Promise.all(
      batches.map((batch: TString[]) =>
        this.translateBatch(batch, client, args, remoteConfig.project_id)
      )
    );
    return flatten(results);
  }

  async translateBatch(
    batch: TString[],
    client: v3.TranslationServiceClient,
    args: TServiceArgs,
    projectId: string
  ): Promise<TResult[]> {
    const location = "global";
    const stringsToTranslate = batch.map((tString) => tString.value);
    const request: ITranslateTextRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: stringsToTranslate,
      mimeType: "text/plain",
      sourceLanguageCode: args.srcLng,
      targetLanguageCode: args.targetLng,
    };
    const [response] = await client.translateText(request);
    if (!response.translations) {
      logFatal(`Service did not return translations`);
    }
    return response.translations.map((value, index) => {
      return this.transformGCloudResult(value, batch[index]);
    });
  }

  transformGCloudResult(result: ITranslation, input: TString): TResult {
    if (!result.translatedText) {
      logFatal(
        `Service did not return a result for input '${input.value}' with key '${input.key}'`
      );
    }
    return {
      key: input.key,
      translated: result.translatedText,
    };
  }
}
