import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import {
  commonArgs,
  commonResult,
  enSrc,
  germanTarget,
} from "./core-test-util";
import { TSet } from "../../src/core/core-definitions";

const modifiedTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["hello", "fgebg"],
    ["world", "Wdbhdelt"],
    ["attranslate", "fwfsfs"],
    ["value", "stsd"],
    ["outcome", "sfsef"],
    ["getStarted", "rrw"],
  ]),
};

test("up-to-date cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: null,
    srcCache: enSrc,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 6,
    countUpdated: 0,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("up-to-date cache, up-to-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: germanTarget,
    srcCache: enSrc,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    countNew: 0,
    countUpdated: 0,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

test("up-to-date cache, modified target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    oldTarget: modifiedTarget,
    srcCache: enSrc,
  };
  const expectRes: CoreResults = {
    ...commonResult,
    newTarget: modifiedTarget,
    countNew: 0,
    countUpdated: 0,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
