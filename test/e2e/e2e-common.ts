import { CliArgs } from "../../src/core/core-definitions";
import { getGCloudKeyPath } from "../setup/key-exports";
import { readJsonFile, writeJsonFile } from "../../src/util/util";
import { generateId, runCommand } from "../test-util/test-util";

export const offlineMaxTime = 250;
export const onlineMaxTime = 2500;

export type E2EArgs = CliArgs & { refTargetFile: string };

export const defaultE2EArgs: E2EArgs = {
  srcFile: "test-assets/flat-json/count-en.flat.json",
  srcLng: "en",
  srcFormat: "flat-json",
  targetFile: "default-target.json",
  refTargetFile: "ref-default-target.json",
  targetLng: "de",
  targetFormat: "nested-json",
  service: "google-translate",
  serviceConfig: getGCloudKeyPath(),
  cacheDir: "test-assets/cache",
  matcher: "none",
  deleteStale: "true",
};

const randomTargetMarker = "random_target";

export async function switchToRandomTarget(args: E2EArgs, copy: boolean) {
  const randomTargetFile = `${
    args.targetFile
  }_${randomTargetMarker}_${generateId()}`;
  const fileToCopy = args.targetFile;
  args.targetFile = randomTargetFile;
  if (copy) {
    await runCommand(`cp ${fileToCopy} ${args.targetFile}`);
  }
}

export async function removeTargetFile(args: E2EArgs) {
  const diffCmd = `diff ${args.targetFile} ${args.refTargetFile}`;
  await runCommand(diffCmd);
  await runCommand(`rm ${args.targetFile}`);
}

export function buildE2EArgs(args: E2EArgs): string {
  expect(args.targetFile).toContain(randomTargetMarker); // Guard against race conditions and cascading test failures.
  expect(args.refTargetFile.includes(randomTargetMarker)).toBe(false); // Guard against bogus passes.

  const cmdArgs: string[] = [];
  for (const argKey of Object.keys(args)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const argValue: string | undefined = args[argKey];
    if (argValue !== undefined && argKey !== "refTargetFile") {
      cmdArgs.push(`--${argKey}='${argValue}'`);
    }
  }
  return cmdArgs.join(" ");
}

export function injectJsonProperties(
  jsonPath: string,
  inject: Record<string, unknown>
) {
  const json = readJsonFile(jsonPath);
  const injectJson = { ...json, ...inject };
  writeJsonFile(jsonPath, injectJson);
}

export function modifyJsonProperty(args: {
  jsonPath: string;
  index: number;
  newValue: unknown;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = readJsonFile(args.jsonPath);
  const keys = Object.keys(json);
  json[keys[args.index]] = args.newValue;
  writeJsonFile(args.jsonPath, json);
}
