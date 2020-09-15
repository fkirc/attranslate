import { matchSprintf } from "../../src/matchers/sprintf";
import { replaceInterpolations } from "../../src/matchers";

describe("Sprintf replacer", () => {
  it("should not error when no placeholders are present", () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a test sentence",
      matchSprintf
    );
    expect(clean).toEqual("this is a test sentence");
    expect(replacements).toEqual([]);
  });

  it("should replace sprintf syntax with placeholders", () => {
    const { clean, replacements } = replaceInterpolations(
      "this is a %s sentence with %s placeholders",
      matchSprintf
    );
    expect(clean).toEqual(
      "this is a <span>0</span> sentence with <span>1</span> placeholders"
    );
    expect(replacements).toEqual([
      { from: "%s", to: "<span>0</span>" },
      { from: "%s", to: "<span>1</span>" },
    ]);
  });
});
