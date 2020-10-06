import { getDebugPath, readJsonFile, writeJsonFile } from "../../src/util/util";
import { GCloudKeyFile } from "../../src/services/google-translate";

export const getGCloudKeyPath = () => "gcloud/gcloud_service_account.json";

test("setupGcloudPrivateKey", () => {
  const gcloudTemplatePath = "gcloud/gcloud_service_account_template.json";
  const privateKey = process.env.GCLOUD_PRIVATE_KEY;
  if (!privateKey) {
    console.log("Did not find GCLOUD_PRIVATE_KEY");
    return validateFinalPrivateKey();
  }

  const keyTemplate = readJsonFile<GCloudKeyFile>(gcloudTemplatePath);
  expect(keyTemplate.private_key).toBe("TODO Replace with a real private key");
  keyTemplate.private_key = privateKey.split("\\n").join("\n");
  writeJsonFile(getGCloudKeyPath(), keyTemplate);

  validateFinalPrivateKey();
  console.log(
    `Injected GCLOUD_PRIVATE_KEY into ${getDebugPath(getGCloudKeyPath())}`
  );
});

function validateFinalPrivateKey() {
  const finalKey = readJsonFile<GCloudKeyFile>(getGCloudKeyPath());
  expect(finalKey.private_key).toContain("BEGIN PRIVATE KEY");
}
