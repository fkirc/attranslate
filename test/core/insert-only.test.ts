import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  bogusTranslateTSet,
  commonArgs,
  deTarget,
  enSrc,
  filterTSet,
  translateCoreAssert,
} from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";
import { enumerateSubsets } from "../test-util/test-util";

const insertSets = generateSubTSets(enSrc);

describe.each(insertSets)("insert %p", (insertSet: TSet) => {
  test("insert elements", async () => {
    await insertOnlyTest(insertSet);
  });
});

async function insertOnlyTest(insertEn: Map<string, string | null>) {
  const insertDe = bogusTranslateTSet(insertEn);
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: filterTSet(enSrc, insertEn),
    oldTarget: filterTSet(deTarget, insertEn),
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

function generateSubTSets(fullTSet: TSet): TSet[] {
  const subTSets: TSet[] = [];
  const fullSet: string[] = [];
  fullTSet.forEach((value, key) => {
    fullSet.push(key);
  });
  for (const subset of enumerateSubsets(fullSet)) {
    const sortedSubSet = subset.reverse();
    const subTSet = new Map<string, string | null>();
    sortedSubSet.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      subTSet.set(key, fullTSet.get(key)!);
    });
    subTSets.push(subTSet);
  }
  expect(subTSets.length).toBe(Math.pow(2, fullSet.length));
  return subTSets;
}
