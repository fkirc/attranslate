import { getDebugPath } from "../../src/util/util";
import { GCloudKeyFile } from "../../src/services/google-translate";
import { getGCloudKeyPath } from "./key-exports";
import {
  readManagedJson,
  writeManagedJson,
} from "../../src/file-formats/common/managed-json";

test("setupGcloudPrivateKey", () => {
  const gcloudTemplatePath = "gcloud/gcloud_service_account_template.json";
  const privateKey = process.env.GCLOUD_PRIVATE_KEY;
  if (!privateKey) {
    console.log("Did not find GCLOUD_PRIVATE_KEY");
    return validateFinalPrivateKey();
  }

  const keyTemplate = readManagedJson<GCloudKeyFile>(gcloudTemplatePath);
  expect(keyTemplate.private_key).toBe("Replace with a real private key");
  keyTemplate.private_key = privateKey.split("\\n").join("\n");
  writeManagedJson({ path: getGCloudKeyPath(), object: keyTemplate });

  validateFinalPrivateKey();
  console.log(
    `Injected GCLOUD_PRIVATE_KEY into ${getDebugPath(getGCloudKeyPath())}`
  );
});

function validateFinalPrivateKey() {
  const finalKey = readManagedJson<GCloudKeyFile>(getGCloudKeyPath());
  expect(finalKey.private_key).toContain("BEGIN PRIVATE KEY");
}
