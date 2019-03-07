import { Translate } from '@google-cloud/translate';
import { replaceIcu, reInsertIcu } from '../icu';

const translate = new Translate({ autoRetry: true });

export const translateStrings = async (
  strings: { key: string; value: string }[],
  from: string,
  to: string,
) => {
  return Promise.all(
    strings.map(async string => {
      const { clean, replacements } = replaceIcu(string.value);

      const translationResult = (await translate.translate(clean, {
        from,
        to,
      }))[0];

      return {
        key: string.key,
        original: string.value,
        translated: reInsertIcu(translationResult, replacements),
      };
    }),
  );
};

export default translateStrings;
