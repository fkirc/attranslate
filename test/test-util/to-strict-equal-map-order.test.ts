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

test("incorrect set order", () => {
  toStrictEqualMapOrder(
    {
      set: new Set([1, 2]),
    },
    {
      set: new Set([2, 1]),
    }
  );
});

test("compare nulls", () => {
  toStrictEqualMapOrder(null, null);
});

test("compare nulls child", () => {
  toStrictEqualMapOrder({ child: null }, { child: null });
});

test("compare undefined", () => {
  toStrictEqualMapOrder(undefined, undefined);
});

test("incorrect order parent", () => {
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
  } catch (e: unknown) {
    expect((e as Error).message).toContain("Incorrect map order");
    return;
  }
  fail("Did not detect map order");
});

test("incorrect order child", () => {
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
  } catch (e: unknown) {
    expect((e as Error).message).toContain(
      "The order of a child-map is incorrect"
    );
    return;
  }
  fail("Did not detect map order");
});
