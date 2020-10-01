import { translateCore } from "../../src/core/translate-core";
import { commonArgs, enSrc, deTarget } from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";

const modifiedTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["one", "fgebg"],
    ["two", "Wdbhdelt"],
    ["three", "fwfsfs"],
    ["four", "stsd"],
    ["five", "sfsef"],
    ["six", "rrw"],
    ["leftover", "Outdated"], // TODO: Remove outdated leftovers via option?
  ]),
};

test("up-to-date cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
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

test("up-to-date cache, up-to-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
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

test("up-to-date cache, modified target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: modifiedTarget,
  };
  const expectRes: CoreResults = {
    newTarget: modifiedTarget,
    added: null,
    updated: null,
    skipped: null,
    serviceResults: null,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
