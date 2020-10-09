import { assertPathNotChanged, runCommand } from "../test-util/test-util";
import { join } from "path";
import { modifyJsonProperty } from "./e2e-common";
import { getDebugPath } from "../../src/util/util";

const sampleDir = "sample-scripts";
const targetLngs = ["es", "zh", "de"];
const enSrc = join(sampleDir, "en", "fruits.json");
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
    "Nothing changed, translations are up-to-date.\nNothing changed, translations are up-to-date.\nNothing changed, translations are up-to-date.\n"
  );
  await assertPathNotChanged(sampleDir);
});

test("multi_translate propagate updates", async () => {
  modifyJsonProperty({
    jsonPath: enSrc,
    index: 0,
    newValue: "Modified source prop",
  });
  const targetPaths = getTargetPaths();
  targetPaths.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: targetPath,
      index: 0,
      newValue: "Modified target prop",
    });
  });

  const expectOutput = getExpectedUpdateOutput({
    targetPath: targetPaths[0],
    cachePath,
  });
  const output = await runCommand(`./multi_translate.sh`, sampleDir);
  expect(output).toBe(expectOutput);
  await runCommand(`git checkout ${sampleDir}`); // TODO: Remove this line!
  await assertPathNotChanged(sampleDir);
});

function getExpectedUpdateOutput(args: {
  targetPath: string;
  cachePath: string;
}): string {
  const lines: string[] = [
    "Received 1 results from 'google-translate'...",
    "Update 1 existing translations",
    `Write target ${getDebugPath(args.targetPath)}`,
    `Write cache ${getDebugPath(args.cachePath)}`,
    `Nothing changed, translations are up-to-date.`, // TODO: Remove, concat multiple "received 1 results" instead
    `Nothing changed, translations are up-to-date.`, // TODO: Remove, concat multiple "received 1 results" instead
    "",
  ];
  return lines.join("\n");
}
