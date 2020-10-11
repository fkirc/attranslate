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
import { getDebugPath, logFatal, readJsonFile } from "../util/util";

export interface GCloudKeyFile {
  project_id: string;
  private_key: string;
}

export class GoogleTranslate implements TService {
  // eslint-disable-next-line require-await
  async translateStrings(args: TServiceArgs) {
    const keyFile = readJsonFile<GCloudKeyFile>(args.serviceConfig);
    if (!keyFile.project_id) {
      logFatal(
        `${getDebugPath(args.serviceConfig)} does not contain a project_id`
      );
    }
    const projectId: string = keyFile.project_id;
    const location = "global";

    const clientOptions: ClientOptions = {
      keyFile: args.serviceConfig,
    };
    const client = new TranslationServiceClient(clientOptions);

    const stringsToTranslate = args.strings.map((tString) => tString.value);
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
      return this.transformGCloudResult(value, args.strings[index]);
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
