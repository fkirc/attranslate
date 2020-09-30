import { serviceMap } from "../../src/services/service-definitions";

export interface E2EArgs {
  srcFile: string;
  srcLng: string;
  targetFile: string;
  targetLng: string;
  service: keyof typeof serviceMap;
  serviceConfig: string;
  cacheDir: string;
}

export const defaultE2EArgs: E2EArgs = {
  srcFile: "package.json",
  srcLng: "en",
  targetFile: "tsconfig.json",
  targetLng: "de",
  service: "google-translate",
  serviceConfig: "gcloud/gcloud_service_account.json",
  cacheDir: "test-assets",
};

export function buildE2EArgs(args: E2EArgs): string {
  const cmdArgs: string[] = [];
  for (const argKey of Object.keys(args)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const argValue: string | undefined = args[argKey];
    if (argValue) {
      cmdArgs.push(`--${argKey}='${argValue}'`);
    }
  }
  return cmdArgs.join(" ");
}
