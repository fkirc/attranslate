import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { translateCore } from "../../src/core/translate-core";
import { commonArgs } from "./core-test-util";

interface LngT {
  lng: string;
  t: string;
}

describe.each([
  { lng: "de", t: "Hallo {{translator}}" },
  { lng: "es", t: "Hola {{translator}}" },
  { lng: "fr", t: "Bonjour {{translator}}" },
  { lng: "zh", t: "您好{{translator}}" },
])("Hello %s", (lngT: LngT) => {
  test("Hello international", async () => {
    const srcHello: TSet = new Map([["hello", "Hello {{translator}}"]]);
    const args: CoreArgs = {
      ...commonArgs,
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
      },
      serviceInvocation: {
        inputs: srcHello,
        results: new Map([["hello", lngT.t]]),
      },
      newTarget: new Map([["hello", lngT.t]]),
    };
    const res = await translateCore(args);
    expect(res).toStrictEqual(expectRes);
  });
});
