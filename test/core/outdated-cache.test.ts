import { translateCore } from "../../src/core/translate-core";
import { commonArgs, deTarget } from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";

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
    oldTarget: deTarget,
    srcCache: incompleteCache,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    added: null,
    updated: null,
    serviceResults: null,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("outdated cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: deTarget,
    srcCache: outdatedCache,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    added: new Map(),
    updated: new Map(),
    serviceResults: new Map([["hello", "Hallo"]]),
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

const outdatedCache: TSet = {
  lng: "en",
  translations: new Map([
    ["hello", "cache broken"],
    ["world", "World"],
    ["outcome", "No more slowdowns"],
    ["getStarted", "Get started within minutes"],
  ]),
};

const outdatedTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["hello", "both cache and target broken"],
    ["world", "target broken"],
    ["outcome", "No more slowdowns"],
    ["attranslate", "missing cache"],
  ]),
};

const mixedResult: TSet = {
  lng: "de",
  translations: new Map([
    // TODO: Fix wrong order?
    ["hello", "Hallo"],
    ["value", "Innerhalb von Sekunden übersetzen"],
    ["getStarted", "Beginnen Sie innerhalb von Minuten"],
    ["world", "target broken"],
    ["outcome", "No more slowdowns"],
    ["attranslate", "missing cache"],
  ]),
};

test("outdated cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: outdatedTarget,
    srcCache: outdatedCache,
  };
  const expectRes: CoreResults = {
    newTarget: mixedResult,
    added: new Map([
      ["value", "Innerhalb von Sekunden übersetzen"],
      ["getStarted", "Beginnen Sie innerhalb von Minuten"],
    ]),
    updated: new Map([["hello", "Hallo"]]),
    serviceResults: new Map([
      ["hello", "Hallo"],
      ["value", "Innerhalb von Sekunden übersetzen"],
      ["getStarted", "Beginnen Sie innerhalb von Minuten"],
    ]),
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
