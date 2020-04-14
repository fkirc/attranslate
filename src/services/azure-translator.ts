import fetch from 'node-fetch';

import { TranslationService, TranslationResult, TString } from '.';
import { Matcher, reInsertInterpolations, replaceInterpolations } from '../matchers';

type AzureResponse = {
    translations: [{
        text: string
        to: string
    }]
}

export class AzureTranslator implements TranslationService {

    public name = "Azure";
    private apiKey: string;
    private interpolationMatcher: Matcher;
    private supportedLanguages: Set<string>;

    async initialize(apiKey?: string, interpolationMatcher?: Matcher) {
        if (!apiKey)
            throw new Error(`Please provide an API key for Azure.`);

        this.apiKey = apiKey;
        this.interpolationMatcher = interpolationMatcher;

        this.supportedLanguages = await this.getAvailableLanguages();
    }

    async getAvailableLanguages() {
        const response = await fetch("https://api.cognitive.microsofttranslator.com/languages?api-version=3.0");
        const supported = await response.json() as { 
            translation: { 
                [code: string]: {
                    name: string
                    nativeName: string
                    direction: "ltr" | "rtl"
                }
            }
        };

        const keys = Object.keys(supported.translation);

        const twoLetter = keys.map(l => l.substr(0, 2));

        return new Set(keys.concat(twoLetter));
    }

    supportsLanguage(language: string) {
        return this.supportedLanguages.has(language.toLowerCase());
    }

    async translateStrings(strings: TString[], from: string, to: string): Promise<TranslationResult[]> {
        const root = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";

        const headers = {
            ["Ocp-Apim-Subscription-Key"]: this.apiKey,
            ["Content-Type"]: "application/json; charset=UTF-8"
        };

        const batchSize = 50;
        const result: TranslationResult[] = [];
        var all: Promise<any>[] = [];
        
        while (strings.length) {
            const batch = strings.splice(0, batchSize);

            const toTranslate = batch.map(({ key, value }) => {
                const { clean, replacements } = replaceInterpolations(
                    value,
                    this.interpolationMatcher,
                );

                return { key, value, clean, replacements };
            });

            const body = JSON.stringify(
                toTranslate.map(c => ({ Text: c.clean }))
            );

            all.push(
                fetch(`${root}&from=${from}&to=${to}`, {
                    method: "POST",
                    headers,
                    body,
                })
                .then(async response => {
                    const data = await response.json() as AzureResponse[];

                    for (let i = 0; i < data.length; ++i) {
                        const to = toTranslate[i];

                        const translated = reInsertInterpolations(
                            data[i].translations[0].text, to.replacements);

                        result.push({
                            key: to.key,
                            value: to.value,
                            translated
                        })
                    }
                })
            );
        }

        await Promise.all(all);

        return result;
    }
}