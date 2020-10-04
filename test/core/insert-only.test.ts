import { CoreArgs, CoreResults } from "../../src/core/core-definitions";
import {
  bogusTranslate,
  commonArgs,
  deTarget,
  enSrc,
  filterTSet,
  translateCoreAssert,
} from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

async function insertOnlyTest(insertEn: Map<string, string | null>) {
  const insertKeys = new Set<string>();
  const insertDe = new Map<string, string | null>();
  insertEn.forEach((value, key) => {
    insertKeys.add(key);
    insertDe.set(key, value ? bogusTranslate(value) : null);
  });
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: filterTSet(enSrc, insertKeys),
    oldTarget: filterTSet(deTarget, insertKeys),
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: insertDe,
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: insertEn,
      results: insertDe,
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
}

test("insert in the middle", async () => {
  await insertOnlyTest(new Map([["3", "Three"]]));
});

test("double insert in the middle", async () => {
  await insertOnlyTest(
    new Map([
      ["3", "Three"],
      ["4", "Four"],
    ])
  );
});

test("triple insert in the middle", async () => {
  await insertOnlyTest(
    new Map([
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four"],
    ])
  );
});

test("quadruple insert in the middle", async () => {
  await insertOnlyTest(
    new Map([
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four"],
      ["5", "Five"],
    ])
  );
});

test("insert everything", async () => {
  await insertOnlyTest(
    new Map([
      ["1", "One"],
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four"],
      ["5", "Five"],
      ["6", "Six"],
    ])
  );
});

test("insert everything except of first", async () => {
  await insertOnlyTest(
    new Map([
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four"],
      ["5", "Five"],
      ["6", "Six"],
    ])
  );
});

test("insert everything except of last", async () => {
  await insertOnlyTest(
    new Map([
      ["1", "One"],
      ["2", "Two"],
      ["3", "Three"],
      ["4", "Four"],
      ["5", "Five"],
    ])
  );
});

test("insert first", async () => {
  await insertOnlyTest(new Map([["1", "One"]]));
});

test("insert last", async () => {
  await insertOnlyTest(new Map([["6", "Six"]]));
});

test("insert first and last", async () => {
  await insertOnlyTest(
    new Map([
      ["1", "One"],
      ["6", "Six"],
    ])
  );
});

test("insert double first and double last", async () => {
  await insertOnlyTest(
    new Map([
      ["1", "One"],
      ["2", "Two"],
      ["5", "Five"],
      ["6", "Six"],
    ])
  );
});

test("insert first and middle", async () => {
  await insertOnlyTest(
    new Map([
      ["1", "One"],
      ["3", "Three"],
    ])
  );
});

test("insert last and middle", async () => {
  await insertOnlyTest(
    new Map([
      ["3", "Three"],
      ["6", "Six"],
    ])
  );
});

test("insert 4 5", async () => {
  await insertOnlyTest(
    new Map([
      ["4", "Four"],
      ["5", "Five"],
    ])
  );
});
