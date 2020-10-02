import { translateCore } from "../../src/core/translate-core";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { commonArgs, deTarget, enSrc } from "./core-test-util";

const partialGermanTarget: TSet = new Map([
  ["one", "Inhalt Eins"],
  ["three", "Inhalt Drei"],
  ["six", "Inhalt Sechs"],
]);

test("no cache, no target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    newTarget: deTarget,
    changeSet: {
      added: deTarget,
      updated: null,
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: enSrc,
      results: deTarget,
    },
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

test("no cache, partial target", async () => {
  const args: CoreArgs = {
    ...commonArgs,
    src: enSrc,
    srcCache: null,
    oldTarget: partialGermanTarget,
  };
  const added = new Map<string, string>([
    ["two", "Inhalt Zwei"],
    ["four", "Inhalt vier"],
    ["five", "Inhalt Fünf"],
  ]);
  const expectRes: CoreResults = {
    newTarget: new Map([
      ["two", "Inhalt Zwei"],
      ["four", "Inhalt vier"],
      ["five", "Inhalt Fünf"],
      ["one", "Inhalt Eins"],
      ["three", "Inhalt Drei"],
      ["six", "Inhalt Sechs"],
    ]),
    changeSet: {
      added,
      updated: new Map(),
      skipped: new Map(),
    },
    serviceInvocation: {
      inputs: new Map([
        ["two", "Content Two"],
        ["four", "Content Four"],
        ["five", "Content Five"],
      ]),
      results: added,
    },
  };
  // TODO: Assert translateCore invariants: serviceInvocation.inputs.size >= added.size + updated.size etc.
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});

/*test("no cache, target with stale translation", async () => {
  const oldTarget: TSet = {
    ...germanTarget,
    translations: new Map([["stale stuff", "leftovers"]]),
  };
});*/
