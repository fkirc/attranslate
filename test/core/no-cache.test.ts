import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  commonArgs,
  deTarget,
  enSrc,
  translateCoreAssert,
} from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

const partialGermanTarget: TSet = new Map([
  ["1", "Eins"],
  ["3", "Drei"],
  ["6", "Sechs"],
]);

test("no cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: deTarget,
      updated: new Map(),
      skipped: new Map(),
      removed: null,
    },
    serviceInvocation: {
      inputs: enSrc,
      results: deTarget,
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

test("no cache, clean target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      removed: new Map(),
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

test("no cache, partial target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: partialGermanTarget,
  };
  const added = new Map<string, string>([
    ["2", "Zwei"],
    ["4", "Vier"],
    ["5", "Fünf"],
  ]);
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added,
      updated: new Map(),
      skipped: new Map(),
      removed: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([
        ["2", "Two"],
        ["4", "Four"],
        ["5", "Five"],
      ]),
      results: added,
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

/*test("no cache, target with stale translation", async () => {
  const oldTarget: TSet = {
    ...germanTarget,
    translations: new Map([["stale stuff", "leftovers"]]),
  };
});*/
