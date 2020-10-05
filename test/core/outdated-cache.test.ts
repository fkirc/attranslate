import {
  commonArgs,
  deTarget,
  enSrc,
  translateCoreAssert,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

const incompleteCache: TSet = new Map([
  ["1", "One"],
  ["2", "Two"],
]);

test("incomplete cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: incompleteCache,
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

test("outdated cache, up-do-date target with scrambled order", async () => {
  const scrambledOrderTarget = new Map([
    ["6", "Sechs"],
    ["4", "Vier"],
    ["1", "Eins"],
    ["3", "Drei"],
    ["2", "Zwei"],
    ["5", "Fünf"],
  ]);
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedCache,
    oldTarget: scrambledOrderTarget,
  };
  const expectRes: CoreResults = {
    newTarget: scrambledOrderTarget,
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      removed: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([["1", "One"]]),
      results: new Map([["1", "Eins"]]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

const outdatedCache: TSet = new Map([
  ["1", "One - cache broken"],
  ["2", "Two"],
  ["5", "Five"],
  ["6", "Six"],
]);

const outdatedTarget: TSet = new Map([
  ["1", "One - both cache and target broken"],
  ["2", "Two - target broken"],
  ["3", "Three - missing cache"],
  ["5", "Five"],
]);

const mixedResult: TSet = new Map([
  ["1", "Eins"],
  ["2", "Two - target broken"],
  ["3", "Three - missing cache"],
  ["4", "Vier"],
  ["5", "Five"],
  ["6", "Sechs"],
]);

test("outdated cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedCache,
    oldTarget: outdatedTarget,
  };
  const expectRes: CoreResults = {
    newTarget: mixedResult,
    newSrcCache: args.src,
    changeSet: {
      added: new Map([
        ["4", "Vier"],
        ["6", "Sechs"],
      ]),
      skipped: new Map(),
      updated: new Map([["1", "Eins"]]),
      removed: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([
        ["1", "One"],
        ["4", "Four"],
        ["6", "Six"],
      ]),
      results: new Map([
        ["1", "Eins"],
        ["4", "Vier"],
        ["6", "Sechs"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});
