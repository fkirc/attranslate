import { CliArgs } from "../../src/core/core-definitions";
import { getGCloudKeyPath } from "../setup/prepare-gcloud-keys.test";

export const defaultE2EArgs: CliArgs = {
  srcFile: "test-assets/flat-json/count-en.flat.json",
  srcLng: "en",
  srcFormat: "flat-json",
  targetFile: "default-target.json",
  targetLng: "de",
  targetFormat: "nested-json",
  service: "google-translate",
  serviceConfig: getGCloudKeyPath(),
  cacheDir: "test-assets",
  matcher: "none",
  deleteStale: "true",
};

export function buildE2EArgs(args: CliArgs): string {
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
