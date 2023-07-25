import { commonArgs, enSrc, translateCoreAssert } from "./core-test-util";
import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import {
  injectFakeService,
  TResult,
  TService,
  TServiceArgs,
  TServiceType,
} from "../../src/services/service-definitions";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

class EmptyResultsService implements TService {
  translateStrings(): Promise<TResult[]> {
    const emptyResults: TResult[] = [];
    return Promise.resolve(emptyResults);
  }
}

test("no target, empty service", async () => {
  const service = "empty-results";
  injectFakeService(service, new EmptyResultsService());
  const args: CoreArgs = {
    ...commonArgs,
    service: service as TServiceType,
    src: enSrc,
    oldTarget: null,
  };
  const expectRes: CoreResults = {
    changeSet: {
      added: new Map(),
      updated: new Map(),
      skipped: args.src,
      deleted: null,
    },
    newTarget: new Map(),
    serviceInvocation: {
      inputs: enSrc,
      results: new Map(),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});

const modifiedTarget: TSet = new Map([
  ["1", "Eins"],
  ["2", "Zwei"],
  ["3", "Drei modified"],
  ["4", "stsd"],
  ["5", "sfsef"],
  ["6", "rrw"],
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
    service: service as TServiceType,
    src: enSrc,
    oldTarget: modifiedTarget,
  };
  const expectRes: CoreResults = {
    newTarget: new Map([
      ["1", "Eins"],
      ["2", "Zwei"],
      ["3", "Drei modified"],
      ["4", "Four"],
      ["5", "Five"],
      ["6", "Six"],
    ]),
    changeSet: {
      added: new Map(),
      updated: new Map([
        ["4", "Four"],
        ["5", "Five"],
        ["6", "Six"],
      ]),
      skipped: new Map([
        ["1", "One"],
        ["2", "Two"],
        ["3", "Three"],
      ]),
      deleted: new Map(),
    },
    serviceInvocation: {
      inputs: enSrc,
      results: new Map([
        ["4", "Four"],
        ["5", "Five"],
        ["6", "Six"],
      ]),
    },
  };
  const res = await translateCoreAssert(args);
  toStrictEqualMapOrder(res, expectRes);
});
