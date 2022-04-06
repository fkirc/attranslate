import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { commonArgs, translateCoreAssert } from "./core-test-util";
import { toStrictEqualMapOrder } from "../test-util/to-strict-equal-map-order";

interface LngT {
  lng: string;
  t: string;
}

describe.each([
  { lng: "de", t: "Hallo" },
  { lng: "es", t: "Hola" },
  { lng: "fr", t: "Bonjour" },
  { lng: "zh", t: "你好" },
])("Hello %s", (lngT: LngT) => {
  test("Hello international", async () => {
    const srcHello: TSet = new Map([["hello", "Hello"]]);
    const args: CoreArgs = {
      ...commonArgs,
      service: "zero-config",
      matcher: "i18next",
      src: srcHello,
      oldTarget: null,
      srcCache: null,
      targetLng: lngT.lng,
    };
    const expectRes: CoreResults = {
      changeSet: {
        added: new Map([["hello", lngT.t]]),
        updated: new Map(),
        skipped: new Map(),
        deleted: null,
      },
      serviceInvocation: {
        inputs: srcHello,
        results: new Map([["hello", lngT.t]]),
      },
      newTarget: new Map([["hello", lngT.t]]),
      newSrcCache: args.src,
    };
    const res = await translateCoreAssert(args);
    toStrictEqualMapOrder(res, expectRes);
  });
});
