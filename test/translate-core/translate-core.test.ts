import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import { TSet } from "../../src/core/core-definitions";

const commonArgs: Omit<
  CoreArgs,
  "src" | "oldTarget" | "oldSrcCache" | "targetLng"
> = {
  service: "google-translate", // TODO: Type safety
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu", // TODO: Type safety
};

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
  test("Hello world - no cache", async () => {
    const src: TSet = {
      lng: "en",
      translations: new Map([["hello", "Hello"]]),
    };
    const args: CoreArgs = {
      src,
      oldTarget: null,
      oldSrcCache: null,
      targetLng: lngT.lng,
      ...commonArgs,
    };
    const expectRes: CoreResults = {
      newTarget: {
        lng: lngT.lng,
        translations: new Map([["hello", lngT.t]]),
      },
      newSrcCache: {
        lng: "en",
        translations: new Map([["hello", "Hello"]]),
      },
    };
    const res = await translateCore(args);
    expect(res).toStrictEqual(expectRes);
  });
});

// TODO: Test other core cases.
