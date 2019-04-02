import { GoogleTranslate } from './google-translate';
import { DeepL } from './deepl';
import { DryRun } from './dry-run';
import { ManualTranslation } from './manual';
import { Matcher } from '../matchers';

export interface TranslationResult {
  key: string;
  value: string;
  translated: string;
}
export interface TranslationService {
  name: string;
  initialize: (config?: string, interpolationMatcher?: Matcher) => void;
  getAvailableLanguages: () => Promise<string[]>;
  translateStrings: (
    strings: { key: string; value: string }[],
    from: string,
    to: string,
  ) => Promise<TranslationResult[]>;
}

export const serviceMap: {
  [k: string]: TranslationService;
} = {
  'google-translate': new GoogleTranslate(),
  deepl: new DeepL(),
  'dry-run': new DryRun(),
  manual: new ManualTranslation(),
};
