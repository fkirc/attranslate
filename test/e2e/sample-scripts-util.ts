import {
  assertPathChanged,
  assertPathNotChanged,
  runCommand,
} from "../test-util/test-util";
import { join } from "path";

export const sampleDir = "sample-scripts";

export async function runSampleScript(
  command: string,
  assetDir: string,
  expectModified?: boolean
): Promise<string> {
  const fullAssetDir = join(sampleDir, assetDir);
  const output = await runCommand(command, sampleDir);
  if (expectModified) {
    await assertPathChanged(fullAssetDir);
    await runCommand(`git checkout ${fullAssetDir}`);
  } else {
    await assertPathNotChanged(fullAssetDir);
  }
  return output;
}
