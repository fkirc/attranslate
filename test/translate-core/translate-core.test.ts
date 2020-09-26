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
  srcLng: "en",
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
      translations: [{ key: "hello", value: "Hello" }],
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
        translations: [{ key: "hello", value: lngT.t }],
      },
      newSrcCache: null,
    };
    const res = await translateCore(args);
    expect(res).toStrictEqual(expectRes);
  });
});
