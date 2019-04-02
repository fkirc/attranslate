import fetch from 'node-fetch';

import { TranslationService, TranslationResult } from '.';
import {
  replaceInterpolations,
  reInsertInterpolations,
  Matcher,
} from '../replacers';

const API_ENDPOINT = 'https://api.deepl.com/v2';

export class DeepL implements TranslationService {
  public name = 'DeepL';
  private apiKey: string;
  private interpolationMatcher: Matcher;

  initialize(config?: string, interpolationMatcher?: Matcher) {
    if (!config) {
      throw new Error(`Please provide an API key for DeepL.`);
    }

    this.interpolationMatcher = interpolationMatcher;
    this.apiKey = config;
  }

  async getAvailableLanguages() {
    return ['en', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'pl', 'ru'];
  }

  async translateStrings(
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) {
    return Promise.all(
      strings.map(string => this.translateString(string, from, to)),
    );
  }

  async translateString(
    string: { key: string; value: string },
    from: string,
    to: string,
    triesLeft: number = 5,
  ): Promise<TranslationResult> {
    const { clean, replacements } = replaceInterpolations(
      string.value,
      this.interpolationMatcher,
    );

    const url = new URL(`${API_ENDPOINT}/translate`);
    url.searchParams.append('text', clean);
    url.searchParams.append('source_lang', from.toUpperCase());
    url.searchParams.append('target_lang', to.toUpperCase());
    url.searchParams.append('auth_key', this.apiKey);

    const response = await fetch(String(url));

    if (!response.ok) {
      if (response.status === 429 && triesLeft > 0) {
        return this.translateString(string, from, to, triesLeft - 1);
      }

      throw new Error(
        `[${response.status} ${
          response.statusText
        }]: ${(await response.text()) || 'Empty body'}`,
      );
    }

    return {
      key: string.key,
      value: string.value,
      translated: reInsertInterpolations(
        (await response.json()).translations[0].text,
        replacements,
      ),
    };
  }
}
