import { assertPathNotChanged, runCommand } from "../test-util/test-util";
import { join } from "path";

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
