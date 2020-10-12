import { matchIcu } from "./icu";
import { matchI18Next } from "./i18next";
import { matchSprintf } from "./sprintf";

export const xmlStyleReplacer = (index: number) => `<span>${index}</span>`;
const xmlLeftTag = "<span>";
const xmlRightTag = "</span>";
const spaceXmlRightTag = "</ span>";

export const matchNothing: TMatcher = () => [];

export type TMatcher = (
  input: string,
  replacer: (index: number) => string
) => { from: string; to: string }[];

export type TMatcherType = keyof typeof matcherMap;

export function getTMatcherList(): TMatcherType[] {
  return Object.keys(matcherMap) as TMatcherType[];
}

const matcherMap = {
  none: matchNothing,
  icu: matchIcu,
  i18next: matchI18Next,
  sprintf: matchSprintf,
};

export type Replacer = {
  clean: string;
  replacements: { from: string; to: string }[];
};

export const replaceInterpolations = (
  input: string,
  matcher: TMatcher = matchNothing,
  replacer: (index: number) => string = xmlStyleReplacer
): Replacer => {
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
) => {
  const c1 = clean.replace(`${xmlLeftTag} `, xmlLeftTag);
  const c2 = c1.replace(spaceXmlRightTag, xmlRightTag);
  const c3 = c2.replace(` ${xmlRightTag}`, xmlRightTag);
  return replacements.reduce((acc, cur) => acc.replace(cur.to, cur.from), c3);
};

export function instantiateTMatcher(matcher: TMatcherType): TMatcher {
  if (typeof matcherMap[matcher] === "undefined") {
    throw new Error(`matcher ${matcher} doesn't exist.`);
  }
  return matcherMap[matcher];
}
