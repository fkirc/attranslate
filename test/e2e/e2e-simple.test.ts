import { runTranslate } from "../test-util";

const helloEn = "test-assets/hello-en-flat.json";
const helloDe = "test-assets/hello-de-flat.json";
const commonArgs = `--srcFile='${helloEn}' --srcLng='en' --targetFile='${helloDe}' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'`;

test("up-to-date cache, up-to-date target", async () => {
  const output = await runTranslate(commonArgs);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
});
