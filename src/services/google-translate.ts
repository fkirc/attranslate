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
import { checkNotDir, getDebugPath, logFatal } from "../util/util";
import { chunk, flatten } from "lodash";
import * as v3 from "@google-cloud/translate/build/src/v3";
import { readRawJson } from "../file-formats/common/managed-json";

export interface GCloudKeyFile {
  project_id: string;
  private_key: string;
}

export class GoogleTranslate implements TService {
  async translateStrings(args: TServiceArgs) {
    if (!args.serviceConfig) {
      logFatal(
        "Set '--serviceConfig' to a path that points to a GCloud service account JSON file"
      );
    }
    checkNotDir(args.serviceConfig, { errorHint: "serviceConfig" });
    const keyFile = readRawJson<GCloudKeyFile>(args.serviceConfig).object;
    if (!keyFile.project_id) {
      logFatal(
        `serviceConfig ${getDebugPath(
          args.serviceConfig
        )} does not contain a project_id`
      );
    }
    const projectId: string = keyFile.project_id;

    const clientOptions: ClientOptions = {
      keyFile: args.serviceConfig,
    };
    const client = new TranslationServiceClient(clientOptions);
    const batches: TString[][] = chunk(args.strings, 10);
    const results = await Promise.all(
      batches.map((batch: TString[]) =>
        this.translateBatch(batch, client, args, projectId)
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
      logFatal(`Google-translate did not return translations`);
    }
    return response.translations.map((value, index) => {
      return this.transformGCloudResult(value, batch[index]);
    });
  }

  transformGCloudResult(result: ITranslation, input: TString): TResult {
    if (!result.translatedText) {
      logFatal(
        `Google-translate did not return a result for input '${input.value}' with key '${input.key}'`
      );
    }
    return {
      key: input.key,
      translated: result.translatedText,
    };
  }
}
