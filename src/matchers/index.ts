import { matchIcu } from "./icu";
import { matchI18Next } from "./i18next";
import { matchSprintf } from "./sprintf";

export const xmlStyleReplacer = (index: number) => `<span>${index}</span>`;
export const matchNothing: Matcher = () => [];

export type Matcher = (
  input: string,
  replacer: (index: number) => string
) => { from: string; to: string }[];

export const matcherMap: {
  [k: string]: Matcher;
} = {
  none: matchNothing,
  icu: matchIcu,
  i18next: matchI18Next,
  sprintf: matchSprintf,
};

export const replaceInterpolations = (
  input: string,
  matcher: Matcher = matchNothing,
  replacer: (index: number) => string = xmlStyleReplacer
) => {
  const replacements = matcher(input, replacer);

  const clean = replacements.reduce(
    (acc, cur) => acc.replace(cur.from, cur.to),
    input
  );

  return { clean, replacements };
};

export const reInsertInterpolations = (
  clean: string,
  replacements: { from: string; to: string }[]
) => replacements.reduce((acc, cur) => acc.replace(cur.to, cur.from), clean);
