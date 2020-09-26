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
  { lng: "de", t: "Hallo" },
  { lng: "es", t: "Hola" },
  { lng: "fr", t: "Bonjour" },
  { lng: "it", t: "Ciao" },
])("Hello %s", (lngT: LngT) => {
  test("Hello international", async () => {
    const srcHello: TSet = {
      lng: "en",
      translations: new Map([["hello", "Hello"]]),
    };
    const args: CoreArgs = {
      ...commonArgs,
      src: srcHello,
      oldTarget: null,
      srcCache: null,
      targetLng: lngT.lng,
    };
    const expectRes: CoreResults = {
      countNew: 1,
      countUpdated: 0,
      countService: 1,
      newTarget: {
        lng: lngT.lng,
        translations: new Map([["hello", lngT.t]]),
      },
    };
    const res = await translateCore(args);
    expect(res).toStrictEqual(expectRes);
  });
});
