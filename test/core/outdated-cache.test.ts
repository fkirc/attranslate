import {
  commonArgs,
  deTarget,
  enSrc,
  translateCoreAssert,
} from "./core-test-util";
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
    newSrcCache: args.src,
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

test("outdated cache, up-do-date target with scrambled order", async () => {
  const scrambledOrderTarget = new Map([
    ["six", "Inhalt Sechs"],
    ["four", "Inhalt vier"],
    ["one", "Inhalt Eins"],
    ["three", "Inhalt Drei"],
    ["two", "Inhalt Zwei"],
    ["five", "Inhalt Fünf"],
  ]);
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedCache,
    oldTarget: scrambledOrderTarget,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget, // TODO: scrambledOrderTarget
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([["one", "Content One"]]),
      results: new Map([["one", "Inhalt Eins"]]),
    },
  };
  const res = await translateCoreAssert(args);
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
    newSrcCache: args.src,
    changeSet: {
      added: new Map([
        ["four", "Inhalt vier"],
        ["six", "Inhalt Sechs"],
      ]),
      skipped: new Map(),
      updated: new Map([["one", "Inhalt Eins"]]),
    },
    serviceInvocation: {
      inputs: new Map([
        ["one", "Content One"],
        ["four", "Content Four"],
        ["six", "Content Six"],
      ]),
      results: new Map([
        ["one", "Inhalt Eins"],
        ["four", "Inhalt vier"],
        ["six", "Inhalt Sechs"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});
