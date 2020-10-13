import { joinLines, runCommand } from "../test-util/test-util";
import { modifyJsonProperty } from "./e2e-common";
import { getDebugPath } from "../../src/util/util";
import { runSampleScript, sampleDir } from "./sample-scripts-util";
import { join } from "path";

const targetLngs = ["es", "zh", "de"];

function getTargetPaths(): string[] {
  return targetLngs.map((targetLng) => {
    return join(sampleDir, targetLng, "fruits.json");
  });
}

const sourcePath = join(sampleDir, "en", "fruits.json");
const cachePath = join(
  sampleDir,
  "translate-cache",
  "attranslate-cache-en_fruits.json.json"
);

test("simple_translate", async () => {
  const output = await runSampleScript(`./simple_translate.sh`);
  expect(output).toBe("Target is up-to-date: 'de/fruits.json'\n");
});

test("multi_translate clean", async () => {
  const output = await runSampleScript(`./multi_translate.sh`);
  expect(output).toBe(
    joinLines([
      "Target is up-to-date: 'es/fruits.json'",
      "Target is up-to-date: 'zh/fruits.json'",
      "Target is up-to-date: 'de/fruits.json'",
    ])
  );
});

test("multi_translate create new cache", async () => {
  await runCommand(`rm ${cachePath}`);

  const targetPaths = getTargetPaths();
  const expectOutput = expectedCreateOutput({
    targetPaths,
    cachePath,
  });
  const output = await runSampleScript(`./multi_translate.sh`);
  expect(output).toBe(expectOutput);
});

function expectedCreateOutput(args: {
  targetPaths: string[];
  cachePath: string;
}): string {
  const firstPass: string[] = [
    `Cache not found -> Generate a new cache to enable selective translations.`,
    `To make selective translations, do one of the following:`,
    "Option 1: Change your source-file and then re-run this tool.",
    "Option 2: Delete parts of your target-file and then re-run this tool.",
    "Skipped translations because we had to generate a new cache.",
    `Write cache ${getDebugPath(cachePath)}`,
  ];
  const secondPass: string[] = [
    `Write cache ${getDebugPath(cachePath)}`,
    `Target is up-to-date: 'zh/fruits.json'`,
  ];
  const thirdPass: string[] = [
    `Write cache ${getDebugPath(cachePath)}`,
    `Target is up-to-date: 'de/fruits.json'`,
  ];
  return joinLines(firstPass.concat(secondPass).concat(thirdPass));
}

test("multi_translate propagate updates to null-targets", async () => {
  const targetPaths = getTargetPaths();
  targetPaths.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: targetPath,
      index: 0,
      newValue: null,
    });
  });

  const expectOutput = expectedUpdateOutput({
    targetPaths,
    cachePath,
    bypassEmpty: false,
  });
  const output = await runSampleScript(`./multi_translate.sh`);
  expect(output).toBe(expectOutput);
});

test("multi_translate propagate empty string from source", async () => {
  const targetPaths = getTargetPaths();

  targetPaths.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: sourcePath,
      index: 0,
      newValue: "",
    });
  });
  const expectOutput = expectedUpdateOutput({
    targetPaths,
    cachePath,
    bypassEmpty: true,
  });
  const output = await runSampleScript(`./multi_translate.sh`, true);
  expect(output).toBe(expectOutput);
});

function expectedUpdateOutput(args: {
  targetPaths: string[];
  cachePath: string;
  bypassEmpty: boolean;
}): string {
  const lines: string[] = [];
  args.targetPaths.forEach((targetPath, index) => {
    const recv = args.bypassEmpty
      ? "Bypass 1 strings because they are empty..."
      : `Invoke 'google-translate' from 'en' to '${targetLngs[index]}' with 1 inputs...`;
    lines.push(
      ...[
        recv,
        "Update 1 existing translations",
        `Write target ${getDebugPath(targetPath)}`,
        `Write cache ${getDebugPath(args.cachePath)}`,
      ]
    );
  });
  return joinLines(lines);
}
