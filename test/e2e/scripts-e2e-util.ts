import { assertPathNotChanged, runCommand } from "../test-util/test-util";
import { join } from "path";
import { readUtf8File, writeUtf8File } from "../../src/util/util";

export const sampleDir = "sample-scripts";

export async function runSampleScript(
  command: string,
  assetDirs: string[]
): Promise<string> {
  const output = await runCommand(command, sampleDir);
  for (const assetDir of assetDirs) {
    const fullAssetDir = join(sampleDir, assetDir);
    await assertPathNotChanged(fullAssetDir);
  }
  return output;
}

export function injectPrefixLines(args: { path: string; lines: string[] }) {
  const str = readUtf8File(args.path);
  const modifiedStr = `${args.lines.join("\n")}\n${str}`;
  writeUtf8File(args.path, modifiedStr);
}

export function removeLines(args: { path: string; linesToRemove: string[] }) {
  const str = readUtf8File(args.path);
  const lines = str.split("\n");
  const filteredLines = lines.filter((line) => {
    return !args.linesToRemove.includes(line);
  });
  writeUtf8File(args.path, filteredLines.join("\n"));
}
