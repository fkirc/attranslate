import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import { commonArgs, commonResult, germanTarget } from "./core-test-util";
import { TSet } from "../../src/core/core-definitions";

const incompleteCache: TSet = {
  lng: "en",
  translations: new Map([
    ["hello", "Hello"],
    ["world", "World"],
  ]),
};

test("incomplete cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: germanTarget,
    srcCache: incompleteCache,
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

test("outdated cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: germanTarget,
    srcCache: outdatedCache,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 0,
    countUpdated: 0,
    countService: 3,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

const outdatedCache: TSet = {
  lng: "en",
  translations: new Map([
    ["hello", "Chrallo"],
    ["world", "Wolt"],
    ["attranslate", "ATTT"],
    ["outcome", "No more slowdowns"],
    ["getStarted", "Get started within minutes"],
  ]),
};

const outdatedTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["hello", "Hello"],
    ["world", "World"],
    ["attranslate", "fwfsfs"],
    ["outcome", "sfsef"],
  ]),
};

export const mixedResult: TSet = {
  lng: "de",
  translations: new Map([
    ["hello", "Hallo"],
    ["world", "Welt"],
    ["attranslate", "Automatisierter Textübersetzer"],
    ["value", "Innerhalb von Sekunden übersetzen"],
    ["getStarted", "Beginnen Sie innerhalb von Minuten"], // TODO: Fix wrong order?
    ["outcome", "sfsef"],
  ]),
};

test("outdated cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: outdatedTarget,
    srcCache: outdatedCache,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    newTarget: mixedResult,
    countNew: 2,
    countUpdated: 3,
    countService: 5,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
