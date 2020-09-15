// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse } from "messageformat-parser";
import { Matcher } from ".";

export const matchIcu: Matcher = (
  input: string,
  replacer: (i: number) => string
) => {
  const parts = parse(input);

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
