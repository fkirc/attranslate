import { CliArgs } from "../../src/core/core-definitions";
import { getGCloudKeyPath } from "../setup/key-exports";
import { readJsonFile, writeJsonFile } from "../../src/util/util";
import { generateId, runCommand, runTranslate } from "../test-util/test-util";

export const offlineMaxTime = 300;
export const onlineMaxTime = 3000;

export type E2EArgs = CliArgs & { refTargetFile: string };

const randomTargetMarker = "random_target";

export const defaultE2EArgs: E2EArgs = {
  srcFile: "test-assets/nested-json/count-en.json",
  srcLng: "en",
  srcFormat: "nested-json",
  targetFile: getRandomTargetName("default_target"),
  refTargetFile: "default-ref-target",
  targetLng: "de",
  targetFormat: "flat-json",
  service: "google-translate",
  serviceConfig: getGCloudKeyPath(),
  cacheDir: "test-assets/cache",
  matcher: "none",
  deleteStale: "true",
};

function getRandomTargetName(path: string) {
  return `${path}_${randomTargetMarker}_${generateId()}`;
}

export async function switchToRandomTarget(args: E2EArgs, copy: boolean) {
  const fileToCopy = args.targetFile;
  args.targetFile = getRandomTargetName(args.targetFile);
  if (copy) {
    await runCommand(`cp ${fileToCopy} ${args.targetFile}`);
  }
}

export async function removeTargetFile(args: E2EArgs) {
  if (process.env.GENERATE_REFS) {
    await runCommand(`cp ${args.targetFile} ${args.refTargetFile}`);
  }
  const diffCmd = `diff ${args.targetFile} ${args.refTargetFile}`;
  await runCommand(diffCmd);
  await runCommand(`rm ${args.targetFile}`);
}

export async function runE2E(args: E2EArgs, options?: { maxTime: number }) {
  return await runTranslate(buildE2EArgs(args), options);
}

export function buildE2EArgs(args: E2EArgs, unsafe?: boolean): string {
  if (args.targetFile?.trim()?.length && !unsafe) {
    expect(args.targetFile).toContain(randomTargetMarker); // Guard against race conditions and cascading test failures.
  }
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
