import {
  commonArgs,
  deTarget,
  enSrc,
  translateCoreAssert,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

const incompleteSkippedCache: TSet = new Map([
  ["1", "One"],
  ["2", null],
]);

test("incomplete skipped cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: incompleteSkippedCache,
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
    serviceInvocation: {
      inputs: new Map([["2", "Two"]]),
      results: new Map([["2", "Zwei"]]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

test("outdated skipped cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedSkippedCache,
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
    serviceInvocation: {
      inputs: new Map([
        ["1", "One"],
        ["5", "Five"],
      ]),
      results: new Map([
        ["1", "Eins"],
        ["5", "Fünf"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

const outdatedSkippedCache: TSet = new Map([
  ["1", "One - cache broken"],
  ["2", "Two"],
  ["5", null],
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
  ["5", "Fünf"],
  ["6", "Sechs"],
]);

test("outdated skipped cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedSkippedCache,
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
      updated: new Map([
        ["1", "Eins"],
        ["5", "Fünf"],
      ]),
      removed: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([
        ["1", "One"],
        ["5", "Five"],
        ["4", "Four"],
        ["6", "Six"],
      ]),
      results: new Map([
        ["1", "Eins"],
        ["5", "Fünf"],
        ["4", "Vier"],
        ["6", "Sechs"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});
