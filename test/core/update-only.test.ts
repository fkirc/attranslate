import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  bogusTranslateTSet,
  commonArgs,
  deTarget,
  enSrc,
  generateSubTSets,
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
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    changeSet: {
      added: new Map(),
      updated: updateDe,
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
