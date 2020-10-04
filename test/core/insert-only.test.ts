import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  bogusTranslate,
  commonArgs,
  deTarget,
  enSrc,
  filterTSet,
  translateCoreAssert,
} from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";
import { enumerateSubsets } from "../test-util/test-util";

const insertSets = generateInsertSets();

describe.each(insertSets)("insert %p", (insertSet: TSet) => {
  test("insert elements", async () => {
    await insertOnlyTest(insertSet);
  });
});

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
    serviceInvocation: insertEn.size
      ? {
          inputs: insertEn,
          results: insertDe,
        }
      : null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
}

function generateInsertSets(): TSet[] {
  const insertSets: TSet[] = [];
  const fullSet: string[] = [];
  enSrc.forEach((value, key) => {
    fullSet.push(key);
  });
  for (const subset of enumerateSubsets(fullSet)) {
    const sortedSubSet = subset
      .slice()
      .sort((a, b) => parseInt(a) - parseInt(b));
    const subInsertSet = new Map<string, string | null>();
    sortedSubSet.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      subInsertSet.set(key, enSrc.get(key)!);
    });
    insertSets.push(subInsertSet);
  }
  expect(insertSets.length).toBe(64);
  return insertSets;
}
