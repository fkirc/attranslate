import { Translate } from '@google-cloud/translate';
import { replaceIcu, reInsertIcu } from '../util/icu';
import { TranslationService } from '.';

export class GoogleTranslate implements TranslationService {
  private translate: Translate;

  public name = 'Google Translate';

  cleanResponse(response: string) {
    return response.replace(
      /\<(.+?)\s*\>\s*(.+?)\s*\<\/\s*(.+?)>/g,
      '<$1>$2</$3>',
    );
  }

  initialize(config?: string) {
    this.translate = new Translate({
      autoRetry: true,
      keyFilename: config || undefined,
    });
  }

  async getAvailableLanguages() {
    const [languages] = await this.translate.getLanguages();
    return languages.map(l => l.code.toLowerCase());
  }

  async translateStrings(
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) {
    return Promise.all(
      strings.map(async ({ key, value }) => {
        const { clean, replacements } = replaceIcu(value);

        const translationResult = (await this.translate.translate(clean, {
          from,
          to,
        }))[0];

        return {
          key: key,
          value: value,
          translated: this.cleanResponse(
            reInsertIcu(translationResult, replacements),
          ),
        };
      }),
    );
  }
}
