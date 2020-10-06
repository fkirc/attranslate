import { readJsonFile } from "../../src/util/util";
import { GCloudKeyFile } from "../../src/services/google-translate";

test("setupGcloudPrivateKey", () => {
  //const privateKey = "jioo";
  const serviceAccount = readJsonFile<GCloudKeyFile>(
    "gcloud/gcloud_service_account.json"
  );
  expect(serviceAccount.private_key).toContain("BEGIN PRIVATE KEY");
});
