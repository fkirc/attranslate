import { translateCore } from "../../src/core/translate-core";
import { commonArgs, deTarget, enSrc } from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";

const incompleteCache: TSet = new Map([
  ["one", "Content One"],
  ["two", "Content Two"],
]);

test("incomplete cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: incompleteCache,
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

test("outdated cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedCache,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    added: new Map(),
    updated: new Map(),
    skipped: new Map(),
    serviceResults: new Map([["one", "Inhalt Eins"]]),
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

const outdatedCache: TSet = new Map([
  ["one", "Content One - cache broken"],
  ["two", "Content Two"],
  ["five", "Content Five"],
  ["six", "Content Six"],
]);

const outdatedTarget: TSet = new Map([
  ["one", "Content One - both cache and target broken"],
  ["two", "Content Two - target broken"],
  ["three", "Content Three - missing cache"],
  ["five", "Content Five"],
]);

const mixedResult: TSet = new Map([
  ["one", "Inhalt Eins"],
  ["two", "Content Two - target broken"],
  ["three", "Content Three - missing cache"],
  ["four", "Inhalt vier"],
  ["six", "Inhalt Sechs"], // TODO: Fix wrong order
  ["five", "Content Five"],
]);

test("outdated cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedCache,
    oldTarget: outdatedTarget,
  };
  const expectRes: CoreResults = {
    newTarget: mixedResult,
    added: new Map([
      ["four", "Inhalt vier"],
      ["six", "Inhalt Sechs"],
    ]),
    skipped: new Map(),
    updated: new Map([["one", "Inhalt Eins"]]),
    serviceResults: new Map([
      ["one", "Inhalt Eins"],
      ["four", "Inhalt vier"],
      ["six", "Inhalt Sechs"],
    ]),
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
