import {
  commonArgs,
  enSrc,
  translateCoreAssert,
  injectFakeService,
} from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  serviceMap,
  TResult,
  TService,
  TServiceArgs,
} from "../../src/services/service-definitions";

class EmptyResultsService implements TService {
  translateStrings(): Promise<TResult[]> {
    const emptyResults: TResult[] = [];
    return Promise.resolve(emptyResults);
  }
}

test("up-to-date cache, no target, empty service", async () => {
  const service = "empty-results";
  injectFakeService(service, new EmptyResultsService());
  const args: CoreArgs = {
    ...commonArgs,
    service: service as keyof typeof serviceMap,
    src: enSrc,
    srcCache: enSrc,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: args.src,
    },
    newTarget: new Map(),
    newSrcCache: new Map([
      ["one", null],
      ["two", null],
      ["three", null],
      ["four", null],
      ["five", null],
      ["six", null],
    ]),
    serviceInvocation: {
      inputs: enSrc,
      results: new Map(),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});

const modifiedTarget: TSet = new Map([
  ["one", "Content One"],
  ["two", "Content Two"],
  ["three", "fwfsfs"],
  ["four", "stsd"],
  ["five", "sfsef"],
  ["six", "rrw"],
  ["seven", "Content Seven"],
]);

class PartialResultsService implements TService {
  translateStrings(args: TServiceArgs): Promise<TResult[]> {
    const sliceIndex = Math.floor(args.strings.length / 2);
    const selection = args.strings.slice(sliceIndex);
    const results: TResult[] = selection.map((v) => {
      return {
        key: v.key,
        translated: v.value,
      };
    });
    return Promise.resolve(results);
  }
}

test("bogus cache, modified target, partial service", async () => {
  const service = "partial-results";
  injectFakeService(service, new PartialResultsService());
  const args: CoreArgs = {
    ...commonArgs,
    service: service as keyof typeof serviceMap,
    src: enSrc,
    srcCache: modifiedTarget,
    oldTarget: modifiedTarget,
  };
  // TODO: Fix order
  const expectRes: CoreResults = {
    newTarget: new Map([
      ["five", "Content Five"],
      ["six", "Content Six"],
      ["one", "Content One"],
      ["two", "Content Two"],
      ["three", "fwfsfs"],
      ["four", "stsd"],
      ["seven", "Content Seven"],
    ]),
    newSrcCache: new Map([
      ["one", "Content One"],
      ["two", "Content Two"],
      ["three", null],
      ["four", null],
      ["five", "Content Five"],
      ["six", "Content Six"],
    ]),
    changeSet: {
      added: new Map(),
      updated: new Map([
        ["five", "Content Five"],
        ["six", "Content Six"],
      ]),
      skipped: new Map([
        ["three", "Content Three"],
        ["four", "Content Four"],
      ]),
    },
    serviceInvocation: {
      inputs: new Map([
        ["three", "Content Three"],
        ["four", "Content Four"],
        ["five", "Content Five"],
        ["six", "Content Six"],
      ]),
      results: new Map([
        ["five", "Content Five"],
        ["six", "Content Six"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  expect(res).toStrictEqual(expectRes);
});
