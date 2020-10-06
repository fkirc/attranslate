import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  bogusTranslateTSet,
  commonArgs,
  deTarget,
  enSrc,
  filterTSet,
  generateSubTSets,
  getRandomBoolean,
  translateCoreAssert,
} from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

const subsets = generateSubTSets(enSrc);

describe.each(subsets)("insert %p", (insertSet: TSet) => {
  test("insert elements", async () => {
    await insertOnlyTest(insertSet);
  });
});

async function insertOnlyTest(insertEn: Map<string, string | null>) {
  const insertDe = bogusTranslateTSet(insertEn);
  const cacheOutdated = getRandomBoolean();
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: cacheOutdated ? filterTSet(enSrc, insertEn) : enSrc,
    oldTarget: filterTSet(deTarget, insertEn),
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: insertDe,
      updated: new Map(),
      skipped: new Map(),
      deleted: new Map(),
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
