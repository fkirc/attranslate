import { TSet } from "../../src/core/core-definitions";
import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import { commonArgs } from "./core-test-util";

interface LngT {
  lng: string;
  t: string;
}

describe.each([
  { lng: "de", t: "Hallo {{name}}" },
  { lng: "es", t: "Hola, {{name}}" },
  { lng: "fr", t: "Bonjour {{name}}" },
  { lng: "it", t: "Salve {{name}}" },
])("Hello %s", (lngT: LngT) => {
  test("Hello international", async () => {
    const srcHello: TSet = {
      lng: "en",
      translations: new Map([["hello", "Hello {{name}}"]]),
    };
    const args: CoreArgs = {
      ...commonArgs,
      matcher: "none",
      src: srcHello,
      oldTarget: null,
      srcCache: null,
      targetLng: lngT.lng,
    };
    const expectRes: CoreResults = {
      added: new Map([["hello", lngT.t]]),
      updated: null,
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
