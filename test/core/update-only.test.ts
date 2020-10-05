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

describe.each(subsets)("update %p", (updateSet: TSet) => {
  test("update elements", async () => {
    await updateOnlyTest(updateSet);
  });
});

async function updateOnlyTest(updateEn: Map<string, string | null>) {
  const updateDe = bogusTranslateTSet(updateEn);
  const targetOutdated = getRandomBoolean();
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: filterTSet(enSrc, updateEn, "cache garbage"),
    oldTarget: targetOutdated
      ? filterTSet(deTarget, updateEn, "target garbage")
      : deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: targetOutdated ? updateDe : new Map(),
      skipped: new Map(),
      deleted: new Map(),
    },
    serviceInvocation: updateEn.size
      ? {
          inputs: updateEn,
          results: updateDe,
        }
      : null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
}
