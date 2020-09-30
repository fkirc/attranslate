import { matchIcu } from "../../src/matchers/icu";
import { replaceInterpolations } from "../../src/matchers/matcher-definitions";

describe("ICU replacer", () => {
  it("should not error when no placeholders are present", () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a test sentence",
      matchIcu
    );
    expect(clean).toEqual("this is a test sentence");
    expect(replacements).toEqual([]);
  });

  it("should replace ICU syntax with placeholders", () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a {test} sentence with {multiple} placeholders",
      matchIcu
    );
    expect(clean).toEqual(
      "this is a <span>0</span> sentence with <span>1</span> placeholders"
    );
    expect(replacements).toEqual([
      { from: "{test}", to: "<span>0</span>" },
      { from: "{multiple}", to: "<span>1</span>" },
    ]);
  });

  it("should replace ICU syntax with placeholders at the end", () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a {test} sentence with {placeholders}",
      matchIcu
    );
    expect(clean).toEqual(
      "this is a <span>0</span> sentence with <span>1</span>"
    );
    expect(replacements).toEqual([
      { from: "{test}", to: "<span>0</span>" },
      { from: "{placeholders}", to: "<span>1</span>" },
    ]);
  });
});
