import { Translate } from '@google-cloud/translate';
import { parse } from 'messageformat-parser';

const translate = new Translate({ autoRetry: true });

export const generateSearchRegex = (input: string) => {
  const parts = parse(input);

  return new RegExp(
    parts
      .map((part: string) =>
        typeof part === 'string'
          ? part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          : '(.+?)',
      )
      .join(''),
  );
};

export const replaceIcu = (input: string) => {
  const searchRegex = generateSearchRegex(input);
  const matches = input.match(searchRegex);

  const replacements = matches.slice(1).map((match, index) => ({
    from: match,
    to: `{${index}}`,
  }));

  const clean = replacements.reduce(
    (acc, cur) => acc.replace(cur.from, cur.to),
    input,
  );

  return { clean, replacements };
};

export const reInsertIcu = (
  clean: string,
  replacements: { from: string; to: string }[],
) => replacements.reduce((acc, cur) => acc.replace(cur.to, cur.from), clean);

export const translateStrings = async (
  strings: {key: string, value: string}[],
  from: string,
  to: string,
) => {
  const results: { key: string, original: string; translated: string }[] = [];

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
