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
    const srcHello: TSet = {
      lng: "en",
      translations: new Map([["hello", "Hello {{translator}}"]]),
    };
    const args: CoreArgs = {
      ...commonArgs,
      matcher: "i18next",
      src: srcHello,
      oldTarget: null,
      srcCache: null,
      targetLng: lngT.lng,
    };
    const expectRes: CoreResults = {
      added: new Map([["hello", lngT.t]]),
      updated: null,
      skipped: new Map(),
      serviceResults: new Map([["hello", lngT.t]]),
      newTarget: {
        lng: lngT.lng,
        translations: new Map([["hello", lngT.t]]),
      },
    };
    const res = await translateCore(args);
    expect(res).toStrictEqual(expectRes);
  });
});
