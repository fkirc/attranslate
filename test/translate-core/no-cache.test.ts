import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import { TSet } from "../../src/core/core-definitions";
import { commonArgs, commonResult, germanTarget } from "./core-test-util";

const partialGermanTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["world", "Welt"],
    ["attranslate", "Automatisierter Textübersetzer"],
    ["getStarted", "Beginnen Sie innerhalb von Minuten"],
  ]),
};

test("no cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: null,
    srcCache: null,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 6,
    countUpdated: 0,
    countService: 6,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("no cache, clean target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: germanTarget,
    srcCache: null,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 0,
    countUpdated: 0,
    countService: 0,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("no cache, partial target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: partialGermanTarget,
    srcCache: null,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 3,
    countUpdated: 0,
    countService: 3,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

/*test("no cache, target with stale translation", async () => {
  const oldTarget: TSet = {
    ...germanTarget,
    translations: new Map([["stale stuff", "leftovers"]]),
  };
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget,
    srcCache: null,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    newTarget: germanTarget,
    countNew: 6,
    countUpdated: 0,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});*/
