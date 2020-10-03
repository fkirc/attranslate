import {
  commonArgs,
  deTarget,
  enSrc,
  translateCoreAssert,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";

const incompleteSkippedCache: TSet = new Map([
  ["one", "Content One"],
  ["two", null],
]);

test("incomplete skipped cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: incompleteSkippedCache,
    oldTarget: deTarget,
  };
  const expectRes: CoreResults = {
    newTarget: new Map([
      ["two", "Inhalt Zwei"],
      ["one", "Inhalt Eins"], // TODO: Fix wrong order, then change to deTarget
      ["three", "Inhalt Drei"],
      ["four", "Inhalt vier"],
      ["five", "Inhalt Fünf"],
      ["six", "Inhalt Sechs"],
    ]),
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([["two", "Content Two"]]),
      results: new Map([["two", "Inhalt Zwei"]]),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});

test("outdated skipped cache, up-do-date target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedSkippedCache,
    oldTarget: deTarget,
  };
  // TODO: Fix wrong order, then change to deTarget
  const expectRes: CoreResults = {
    newTarget: new Map([
      ["one", "Inhalt Eins"],
      ["five", "Inhalt Fünf"],
      ["two", "Inhalt Zwei"],
      ["three", "Inhalt Drei"],
      ["four", "Inhalt vier"],
      ["six", "Inhalt Sechs"],
    ]),
    newSrcCache: args.src,
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([
        ["one", "Content One"],
        ["five", "Content Five"],
      ]),
      results: new Map([
        ["one", "Inhalt Eins"],
        ["five", "Inhalt Fünf"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});

const outdatedSkippedCache: TSet = new Map([
  ["one", "Content One - cache broken"],
  ["two", "Content Two"],
  ["five", null],
  ["six", "Content Six"],
]);

const outdatedTarget: TSet = new Map([
  ["one", "Content One - both cache and target broken"],
  ["two", "Content Two - target broken"],
  ["three", "Content Three - missing cache"],
  ["five", "Content Five"],
]);

// TODO: Fix wrong order
const mixedResult: TSet = new Map([
  ["one", "Inhalt Eins"],
  ["five", "Inhalt Fünf"],
  ["four", "Inhalt vier"],
  ["six", "Inhalt Sechs"],
  ["two", "Content Two - target broken"],
  ["three", "Content Three - missing cache"],
]);

test("outdated skipped cache, outdated target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: outdatedSkippedCache,
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
      updated: new Map([
        ["one", "Inhalt Eins"],
        ["five", "Inhalt Fünf"],
      ]),
    },
    serviceInvocation: {
      inputs: new Map([
        ["one", "Content One"],
        ["five", "Content Five"],
        ["four", "Content Four"],
        ["six", "Content Six"],
      ]),
      results: new Map([
        ["one", "Inhalt Eins"],
        ["five", "Inhalt Fünf"],
        ["four", "Inhalt vier"],
        ["six", "Inhalt Sechs"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});
