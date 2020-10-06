import { readJsonFile, writeJsonFile } from "../../src/util/util";
import { GCloudKeyFile } from "../../src/services/google-translate";

test("setupGcloudPrivateKey", () => {
  const privateKey = process.env.GCLOUD_PRIVATE_KEY;
  if (!privateKey) {
    console.log("Did not find GCLOUD_PRIVATE_KEY");
    return;
  }
  const serviceAccountPath = "gcloud/gcloud_service_account.json";
  const serviceAccount = readJsonFile<GCloudKeyFile>(serviceAccountPath);
  expect(serviceAccount.private_key).toContain("BEGIN PRIVATE KEY");
  serviceAccount.private_key = privateKey.split("\\n").join("\n");
  writeJsonFile(serviceAccountPath, serviceAccount);
});
