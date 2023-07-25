import { commonArgs, enSrc, translateCoreAssert } from "./core-test-util";
import { CoreArgs, CoreResults } from "../../src/core/core-definitions";
import {
  injectFakeService,
  TResult,
  TService,
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
