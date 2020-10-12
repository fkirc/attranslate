import { TMatcher } from "./matcher-definitions";

export const matchSprintf: TMatcher = (
  input: string,
  replacer: (i: number) => string
) => {
  const matches = input.match(/(%.)/g);

  return (matches || []).map((match, index) => ({
    from: match,
    to: replacer(index),
  }));
};
