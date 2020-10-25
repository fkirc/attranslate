import { assertPathNotChanged, runCommand } from "../test-util/test-util";
import { join } from "path";
import { readUtf8File, writeUf8File } from "../../src/util/util";

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
  writeUf8File(args.path, modifiedStr);
}
