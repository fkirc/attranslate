import { translateCore } from "../../src/core/translate-core";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { commonArgs, deTarget, enSrc } from "./core-test-util";

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
    src: enSrc,
    srcCache: null,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    added: deTarget.translations,
    updated: null,
    skipped: new Map(),
    serviceResults: deTarget.translations,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
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
    added: null,
    updated: null,
    skipped: null,
    serviceResults: null,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("no cache, partial target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: partialGermanTarget,
  };
  const added = new Map<string, string>([
    ["hello", "Hallo"],
    ["value", "Innerhalb von Sekunden übersetzen"],
    ["outcome", "Keine Verlangsamungen mehr"],
  ]);
  const expectRes: CoreResults = {
    newTarget: deTarget,
    added,
    updated: new Map(),
    skipped: new Map(),
    serviceResults: added,
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
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});*/
