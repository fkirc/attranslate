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

const subsets = generateSubTSets(enSrc).filter((tSet) => tSet.size <= 5);

describe.each(subsets)("delete %p", (deleteSet: TSet) => {
  test("delete elements", async () => {
    expect(subsets.length).toBe(63);
    await deleteOnlyTest(deleteSet);
  });
});

async function deleteOnlyTest(deleteEn: Map<string, string | null>) {
  const cacheOutdated = getRandomBoolean();
  const deleteDe = bogusTranslateTSet(deleteEn);
  const shrinkedSrc = filterTSet(enSrc, deleteEn);
  const args: CoreArgs = {
    ...commonArgs,
    src: shrinkedSrc,
    srcCache: cacheOutdated ? shrinkedSrc : enSrc,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: filterTSet(deTarget, deleteDe),
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      deleted: deleteDe,
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
}
