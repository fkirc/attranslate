import { join } from "path";

export const getGCloudKeyPath = () =>
  join("sample-scripts", "gcloud", "gcloud_service_account.json");
