import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  bogusTranslateTSet,
  commonArgs,
  deTarget,
  enSrc,
  filterTSet,
  generateSubTSets,
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
  const deleteDe = bogusTranslateTSet(deleteEn);
  const args: CoreArgs = {
    ...commonArgs,
    src: filterTSet(enSrc, deleteEn),
    srcCache: enSrc,
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
