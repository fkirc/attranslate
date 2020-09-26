import {
  CoreArgs,
  CoreResults,
  translateCore,
} from "../../src/core/translate-core";
import { TSet } from "../../src/core/core-definitions";

const commonArgs: Omit<CoreArgs, "src" | "oldTarget" | "oldSrcCache"> = {
  srcLng: "en",
  targetLng: "de",
  service: "google-translate", // TODO: Type safety
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu", // TODO: Type safety
};

test("simpleTranslate", async () => {
  const src: TSet = {
    translations: [{ key: "hello", value: "Hello" }],
  };
  const args: CoreArgs = {
    src,
    oldTarget: null,
    oldSrcCache: null,
    ...commonArgs,
  };
  const expectRes: CoreResults = {
    newTarget: {
      translations: [{ key: "hello", value: "Hallo" }],
    },
    newSrcCache: null,
  };
  const res = await translateCore(args);
  expect(res).toStrictEqual(expectRes);
});
