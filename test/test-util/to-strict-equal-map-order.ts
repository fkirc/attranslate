// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toStrictEqualMapOrder(received: any, expected: any) {
  // Firstly, run toStrictEqual to ensure that the recursive map-check does not go haywire.
  expect(received).toStrictEqual(expected);
  const res = recursiveMapCheck(received, expected);
  if (res === "CORRECT") {
    return;
  }
  // Error: Inject a bogus property and then re-run toStrictEqual to get a usable error message that shows the differences.
  if (received instanceof Map) {
    received.set("map_error", "Incorrect map order");
    expect(Array.from(received)).toStrictEqual(Array.from(expected));
  } else {
    received["map_error"] = "The order of a child-map is incorrect";
    expect(received).toStrictEqual(expected);
  }
  throw Error("Never reached");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recursiveMapCheck(received: any, expected: any): "CORRECT" | "ERROR" {
  // Jest's toStrictEqual should ensure that received and expected have the same type
  if (typeof received !== "object" || received === null) {
    return "CORRECT";
  }
  if (received instanceof Map) {
    try {
      expect(Array.from(received)).toStrictEqual(Array.from(expected));
    } catch (e) {
      return "ERROR";
    }
  }
  for (const prop of Object.keys(received)) {
    if (recursiveMapCheck(received[prop], expected[prop]) === "ERROR") {
      return "ERROR";
    }
  }
  return "CORRECT";
}
