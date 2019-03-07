import { Translate } from '@google-cloud/translate';
import { replaceIcu, reInsertIcu } from '../icu';

const translate = new Translate({ autoRetry: true });

export const translateStrings = async (
  strings: { key: string; value: string }[],
  from: string,
  to: string,
) => {
  const results: { key: string; original: string; translated: string }[] = [];

  for (const string of strings) {
    const { clean, replacements } = replaceIcu(string.value);

    const translationResult = (await translate.translate(clean, {
      from,
      to,
    }))[0];

    results.push({
      key: string.key,
      original: string.value,
      translated: reInsertIcu(translationResult, replacements),
    });
  }

  return results;
};

export default translateStrings;
