import {
  assertPathNotChanged,
  joinLines,
  runCommand,
} from "../test-util/test-util";
import { join } from "path";
import { modifyJsonProperty } from "./e2e-common";
import { getDebugPath } from "../../src/util/util";

const sampleDir = "sample-scripts";
const targetLngs = ["es", "zh", "de"];
const cachePath = join(
  sampleDir,
  "translate-cache",
  "attranslate-cache-en_fruits.json.json"
);

function getTargetPaths(): string[] {
  return targetLngs.map((targetLng) => {
    return join(sampleDir, targetLng, "fruits.json");
  });
}

test("simple_translate", async () => {
  const output = await runCommand(`./simple_translate.sh`, sampleDir);
  expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  await assertPathNotChanged(sampleDir);
});

test("multi_translate clean", async () => {
  const output = await runCommand(`./multi_translate.sh`, sampleDir);
  expect(output).toBe(
    joinLines([
      "Nothing changed, translations are up-to-date.",
      "Nothing changed, translations are up-to-date.",
      "Nothing changed, translations are up-to-date.",
    ])
  );
  await assertPathNotChanged(sampleDir);
});

test("multi_translate propagate updates", async () => {
  const targetPaths = getTargetPaths();
  targetPaths.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: targetPath,
      index: 0,
      newValue: null,
    });
  });

  const expectOutput = getExpectedUpdateOutput({
    targetPaths,
    cachePath,
  });
  const output = await runCommand(`./multi_translate.sh`, sampleDir);
  expect(output).toBe(expectOutput);
  await assertPathNotChanged(sampleDir);
});

function getExpectedUpdateOutput(args: {
  targetPaths: string[];
  cachePath: string;
}): string {
  const lines: string[] = [];
  args.targetPaths.forEach((targetPath) => {
    lines.push(
      ...[
        "Received 1 results from 'google-translate'...",
        "Update 1 existing translations",
        `Write target ${getDebugPath(targetPath)}`,
        `Write cache ${getDebugPath(args.cachePath)}`,
      ]
    );
  });
  return joinLines(lines);
}
