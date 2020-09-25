import { Translate } from "@google-cloud/translate";
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from "../matchers";
import { TranslationService, TString } from ".";

// Contains replacements for language codes
const codeMap = {
  "zh-tw": "zh-TW",
};

export class GoogleTranslate implements TranslationService {
  private translate: Translate | undefined;
  private interpolationMatcher: Matcher | undefined;
  private supportedLanguages: string[] = [];

  public name = "Google Translate";

  cleanResponse(response: string) {
    return response.replace(
      /\<(.+?)\s*\>\s*(.+?)\s*\<\/\s*(.+?)>/g,
      "<$1>$2</$3>"
    );
  }

  async initialize(config?: string, interpolationMatcher?: Matcher) {
    this.translate = new Translate({
      autoRetry: true,
      keyFilename: config || undefined,
    });

    this.interpolationMatcher = interpolationMatcher;
    this.supportedLanguages = await this.getAvailableLanguages();
  }

  async getAvailableLanguages() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [languages] = await this.translate!.getLanguages();
    console.log("Available languages:");
    console.log(languages);
    return languages.map((l) => l.code.toLowerCase());
  }

  supportsLanguage(language: string) {
    return this.supportedLanguages.includes(language);
  }

  cleanLanguageCode(languageCode: string) {
    const lowerCaseCode = languageCode.toLowerCase();
    console.log("Lower case:", languageCode);

    const codeMapCode = (codeMap as never)[lowerCaseCode];
    if (codeMapCode) {
      return codeMapCode;
    }

    return lowerCaseCode.split("-")[0];
  }

  // eslint-disable-next-line require-await
  async translateStrings(strings: TString[], from: string, to: string) {
    return Promise.all(
      strings.map(async ({ key, value }) => {
        const { clean, replacements } = replaceInterpolations(
          value,
          this.interpolationMatcher
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [translationResult] = await this.translate!.translate(clean, {
          from: this.cleanLanguageCode(from),
          to: this.cleanLanguageCode(to),
        });

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
