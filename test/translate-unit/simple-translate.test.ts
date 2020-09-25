import { translateCore, TranslateArgs } from "../../src/core/translate";

test("simpleTranslate", async () => {
  const args: TranslateArgs = {
    srcFile: "test/hello-en.json",
    srcLng: "en",
    dstFile: "test/hello-de.json",
    dstLng: "de",
    serviceConfig: "gcloud/gcloud_service_account.json",
  };
  await translateCore(args);
});
