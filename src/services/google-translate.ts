import { TranslationServiceClient } from "@google-cloud/translate";
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from "../matchers/matcher-definitions";
import { TResult, TranslationService, TString } from ".";
import { google } from "@google-cloud/translate/build/protos/protos";
import ITranslateTextRequest = google.cloud.translation.v3.ITranslateTextRequest;
import { ClientOptions } from "google-gax";
import ITranslation = google.cloud.translation.v3.ITranslation;

export class GoogleTranslate implements TranslationService {
  private interpolationMatcher: Matcher | undefined;
  private serviceConfig: string | undefined;

  public name = "Google Translate";

  cleanResponse(response: string) {
    return response.replace(
      /\<(.+?)\s*\>\s*(.+?)\s*\<\/\s*(.+?)>/g,
      "<$1>$2</$3>"
    );
  }

  // eslint-disable-next-line require-await
  async initialize(serviceConfig?: string, interpolationMatcher?: Matcher) {
    this.interpolationMatcher = interpolationMatcher;
    this.serviceConfig = serviceConfig;
  }

  supportsLanguage(language: string) {
    return true; // TODO: Maybe re-implement
  }

  // eslint-disable-next-line require-await
  async translateStrings(inputs: TString[], from: string, to: string) {
    const clientOptions: ClientOptions = {
      keyFile: this.serviceConfig,
    };
    const client = new TranslationServiceClient(clientOptions);
    const projectId = "secure-zip-notes"; // TODO: Read this from service account json?
    const location = "global";

    const interpols = inputs.map((tString) => {
      return replaceInterpolations(tString.value, this.interpolationMatcher);
    });
    const cleanStrings = interpols.map((v) => v.clean);
    const request: ITranslateTextRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: cleanStrings,
      mimeType: "text/plain",
      sourceLanguageCode: from,
      targetLanguageCode: to,
    };
    const [response] = await client.translateText(request);

    // TODO: Error handling
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return response.translations!.map((value, index) => {
      return this.transformGCloudResult(
        value,
        inputs[index],
        interpols[index].replacements
      );
    });
  }

  transformGCloudResult(
    result: ITranslation,
    input: TString,
    replacements: { from: string; to: string }[]
  ): TResult {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rawTranslation = result!.translatedText!; // TODO: Error handling
    const cleanTranslation = reInsertInterpolations(
      rawTranslation,
      replacements
    );
    return {
      key: input.key,
      translated: cleanTranslation,
    };
  }
}
