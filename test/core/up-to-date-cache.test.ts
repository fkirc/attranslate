import { translateCore } from "../../src/core/translate-core";
import { commonArgs, enSrc, deTarget } from "./core-test-util";
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
      updated: null,
      skipped: new Map(),
    },
    newTarget: deTarget,
    serviceInvocation: {
      inputs: enSrc,
      results: deTarget,
    },
  };
  const res = await translateCore(args);
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
      added: null,
      updated: null,
      skipped: null,
    },
    serviceInvocation: null,
  };
  const res = await translateCore(args);
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
      added: null,
      updated: null,
      skipped: null,
    },
    serviceInvocation: null,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
