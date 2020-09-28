export interface E2EArgs {
  srcFile: string;
  srcLng: string;
  targetFile: string;
  targetLng: string;
  serviceConfig: string;
  cacheDir: string;
}

export const defaultE2EArgs: E2EArgs = {
  srcFile: "package.json",
  srcLng: "en",
  targetFile: "tsconfig.json",
  targetLng: "de",
  serviceConfig: "gcloud/gcloud_service_account.json",
  cacheDir: "test-assets",
};

export function buildE2EArgs(args: E2EArgs): string {
  return `--srcFile='${args.srcFile}' --srcLng='${args.srcLng}' --targetFile='${args.targetFile}' --targetLng='${args.targetLng}' --serviceConfig='${args.serviceConfig}' --cacheDir='${args.cacheDir}'`;
}
