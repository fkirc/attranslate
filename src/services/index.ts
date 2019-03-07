import { GoogleTranslate } from './google-translate';
import { DryRun } from './dry-run';
import { ManualTranslation } from './manual';

export interface TranslationResult {
  key: string;
  value: string;
  translated: string;
}
export interface TranslationService {
  name: string;
  initialize: (config?: string) => void;
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
  'dry-run': new DryRun(),
  manual: new ManualTranslation(),
};
