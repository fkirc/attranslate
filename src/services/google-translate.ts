import { Translate } from '@google-cloud/translate';
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from '../matchers';
import { TranslationService, TString } from '.';

export class GoogleTranslate implements TranslationService {
  private translate: Translate;
  private interpolationMatcher: Matcher;
  private supportedLanguages: string[] = [];

  public name = 'Google Translate';

  cleanResponse(response: string) {
    return response.replace(
      /\<(.+?)\s*\>\s*(.+?)\s*\<\/\s*(.+?)>/g,
      '<$1>$2</$3>',
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
    const [languages] = await this.translate.getLanguages();
    return languages.map(l => l.code.toLowerCase());
  }

  supportsLanguage(language: string) {
    return this.supportedLanguages.includes(language);
  }

  async translateStrings(strings: TString[], from: string, to: string) {
    return Promise.all(
      strings.map(async ({ key, value }) => {
        const { clean, replacements } = replaceInterpolations(
          value,
          this.interpolationMatcher,
        );

        const translationResult = (
          await this.translate.translate(clean, {
            from,
            to,
          })
        )[0];

        return {
          key: key,
          value: value,
          translated: this.cleanResponse(
            reInsertInterpolations(translationResult, replacements),
          ),
        };
      }),
    );
  }
}
