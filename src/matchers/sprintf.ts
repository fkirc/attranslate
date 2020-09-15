import { Matcher } from ".";

export const matchSprintf: Matcher = (
  input: string,
  replacer: (i: number) => string
) => {
  const matches = input.match(/(%.)/g);

  return (matches || []).map((match, index) => ({
    from: match,
    to: replacer(index),
  }));
};
