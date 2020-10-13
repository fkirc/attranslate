import {
  assertPathChanged,
  assertPathNotChanged,
  runCommand,
} from "../test-util/test-util";

export const sampleDir = "sample-scripts";

export async function runSampleScript(
  command: string,
  expectModified?: boolean
): Promise<string> {
  const output = await runCommand(command, sampleDir);
  if (expectModified) {
    await assertPathChanged(sampleDir);
    await runCommand(`git checkout ${sampleDir}`);
  } else {
    await assertPathNotChanged(sampleDir);
  }
  return output;
}
