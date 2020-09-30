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
  { lng: "de", t: "Hallo {{person.name}}" },
  { lng: "es", t: "Hola {{person.name}}" },
  { lng: "fr", t: "Bonjour {{person.name}}" },
  { lng: "it", t: "Ciao {{person.name}}" },
])("Hello %s", (lngT: LngT) => {
  test("Hello international", async () => {
    const srcHello: TSet = {
      lng: "en",
      translations: new Map([["hello", "Hello {{person.name}}"]]),
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
