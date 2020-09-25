import { TranslationServiceClient } from "@google-cloud/translate";
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from "../matchers";
import { TranslationService, TString } from ".";
import { google } from "@google-cloud/translate/build/protos/protos";
import ITranslateTextRequest = google.cloud.translation.v3.ITranslateTextRequest;
import { ClientOptions } from "google-gax";

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
  async translateStrings(strings: TString[], from: string, to: string) {
    const clientOptions: ClientOptions = {
      keyFile: this.serviceConfig,
    };
    const client = new TranslationServiceClient(clientOptions);

    return Promise.all(
      strings.map(async ({ key, value }) => {
        const { clean, replacements } = replaceInterpolations(
          value,
          this.interpolationMatcher
        );
        const request: ITranslateTextRequest = {
          contents: [clean],
          mimeType: "text/plain",
          sourceLanguageCode: from,
          targetLanguageCode: to,
        };
        const [response] = await client.translateText(request);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const translationResult: string = response.translations![0]
          .translatedText!; // TODO: Error handling
        return {
          key: key,
          value: value,
          translated: this.cleanResponse(
            reInsertInterpolations(translationResult, replacements)
          ),
        };
      })
    );
  }
}
