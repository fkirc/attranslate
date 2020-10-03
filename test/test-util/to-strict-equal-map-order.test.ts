import { toStrictEqualMapOrder } from "./to-strict-equal-map-order";

test("correct order", () => {
  toStrictEqualMapOrder(
    new Map([
      ["1", "One"],
      ["2", "Two"],
    ]),
    new Map([
      ["1", "One"],
      ["2", "Two"],
    ])
  );
});

test("incorrect order parent object", () => {
  try {
    toStrictEqualMapOrder(
      new Map([
        ["1", "One"],
        ["2", "Two"],
      ]),
      new Map([
        ["2", "Two"],
        ["1", "One"],
      ])
    );
  } catch (e) {
    expect(e.message).toContain("Incorrect map order");
    return;
  }
  fail("Did not detect map order");
});

test("incorrect order child object", () => {
  try {
    toStrictEqualMapOrder(
      {
        childMap: new Map([
          ["1", "One"],
          ["2", "Two"],
        ]),
      },
      {
        childMap: new Map([
          ["2", "Two"],
          ["1", "One"],
        ]),
      }
    );
  } catch (e) {
    expect(e.message).toContain("The order of a child-map is incorrect");
    return;
  }
  fail("Did not detect map order");
});
