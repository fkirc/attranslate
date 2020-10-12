import { TMatcher } from "./matcher-definitions";

let parseModule: null | { parse: (input: string) => string[] } = null;

export const matchIcu: TMatcher = (
  input: string,
  replacer: (i: number) => string
) => {
  // Import parseModule on demand to optimize launch-performance.
  if (!parseModule) {
    parseModule = require("messageformat-parser");
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parts = parseModule!.parse(input);

  const regex = new RegExp(
    parts
      .map((part: string) =>
        typeof part === "string"
          ? part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          : "(.*)"
      )
      .join("")
  );

  const matches = input.match(regex);

  return (matches || []).slice(1).map((match, index) => ({
    from: match,
    to: replacer(index),
  }));
};
