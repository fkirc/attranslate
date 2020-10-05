import {
  commonArgs,
  enSrc,
  deTarget,
  translateCoreAssert,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

test("up-to-date cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    changeSet: {
      added: deTarget,
      updated: new Map(),
      skipped: new Map(),
      deleted: null,
    },
    newTarget: deTarget,
    newSrcCache: args.src,
    serviceInvocation: {
      inputs: enSrc,
      results: deTarget,
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

test("up-to-date cache, up-to-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      deleted: new Map(),
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

const staleTarget: TSet = new Map([
  ["1", "fgebg"],
  ["2", "Wdbhdelt"],
  ["3", "fwfsfs"],
  ["4", "stsd"],
  ["5", "sfsef"],
  ["6", "rrw"],
  ["leftover", "Outdated"],
]);

test("up-to-date cache, do not delete stale", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: staleTarget,
    deleteStale: false,
  };
  const expectRes: CoreResults = {
    newTarget: staleTarget,
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
      deleted: null,
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});
