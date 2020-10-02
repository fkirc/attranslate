import {
  commonArgs,
  enSrc,
  deTarget,
  translateCoreAssert,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";

const modifiedTarget: TSet = new Map([
  ["one", "fgebg"],
  ["two", "Wdbhdelt"],
  ["three", "fwfsfs"],
  ["four", "stsd"],
  ["five", "sfsef"],
  ["six", "rrw"],
  ["leftover", "Outdated"], // TODO: Remove outdated leftovers via option?
]);

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
    },
    newTarget: deTarget,
    serviceInvocation: {
      inputs: enSrc,
      results: deTarget,
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
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
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});

test("up-to-date cache, modified target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: modifiedTarget,
  };
  const expectRes: CoreResults = {
    newTarget: modifiedTarget,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: null,
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});
