import { logFatal, readJsonFile, writeJsonFile } from "../../src/util/util";
import { GCloudKeyFile } from "../../src/services/google-translate";

test("setupGcloudPrivateKey", () => {
  const privateKey = process.env.GCLOUD_PRIVATE_KEY;
  if (!privateKey) {
    logFatal("Did not find GCLOUD_PRIVATE_KEY");
  }
  const serviceAccountPath = "gcloud/gcloud_service_account.json";
  const serviceAccount = readJsonFile<GCloudKeyFile>(serviceAccountPath);
  expect(serviceAccount.private_key).toContain("BEGIN PRIVATE KEY");
  serviceAccount.private_key = privateKey.split("\\n").join("\n");
  writeJsonFile(serviceAccountPath, serviceAccount);
});
