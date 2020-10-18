import { joinLines, runCommand } from "../test-util/test-util";
import { modifyJsonProperty } from "./e2e-common";
import { getDebugPath } from "../../src/util/util";
import { runSampleScript, sampleDir } from "./sample-scripts-util";
import { join } from "path";

test("simple_translate", async () => {
  const output = await runSampleScript(`./simple_translate.sh`, ["json-raw"]);
  expect(output).toBe("Target is up-to-date: 'json-raw/fruits-de.json'\n");
});

const targetLngs = ["es", "zh", "de"];

const assetDir = "json-manual-review";

function jsonTargetPaths(): string[] {
  return targetLngs.map((targetLng) => {
    return join(assetDir, targetLng, "fruits.json");
  });
}

const sourcePath = join(sampleDir, assetDir, "en", "fruits.json");
const cachePath = join(
  sampleDir,
  "translate-cache",
  "attranslate-cache-en_fruits.json.json"
);

async function runMultiJSON(): Promise<string> {
  return await runSampleScript(`./multi_translate.sh`, [assetDir]);
}

test("multi_translate clean", async () => {
  const output = await runMultiJSON();
  expect(output).toBe(
    joinLines(
      jsonTargetPaths().map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("multi_translate create new cache", async () => {
  await runCommand(`rm ${cachePath}`);
  const expectOutput = expectedCreateOutput({
    cachePath,
  });
  const output = await runMultiJSON();
  expect(output).toBe(expectOutput);
});

function expectedCreateOutput(args: { cachePath: string }): string {
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
    `Target is up-to-date: '${assetDir}/zh/fruits.json'`,
  ];
  const thirdPass: string[] = [
    `Write cache ${getDebugPath(cachePath)}`,
    `Target is up-to-date: '${assetDir}/de/fruits.json'`,
  ];
  return joinLines(firstPass.concat(secondPass).concat(thirdPass));
}

test("multi_translate propagate updates to null-targets", async () => {
  const targetPaths = jsonTargetPaths();
  targetPaths.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: join(sampleDir, targetPath),
      index: 0,
      newValue: null,
    });
  });

  const expectOutput = expectedUpdateOutput({
    targetPaths,
    cachePath,
    bypassEmpty: false,
  });
  const output = await runMultiJSON();
  expect(output).toBe(expectOutput);
});

test("multi_translate propagate empty string from source", async () => {
  const targetPaths = jsonTargetPaths();
  modifyJsonProperty({
    jsonPath: sourcePath,
    index: 0,
    newValue: "",
  });
  const expectOutput = expectedUpdateOutput({
    targetPaths,
    cachePath,
    bypassEmpty: true,
  });
  const output = await runMultiJSON();
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
        `Write target ${getDebugPath(join(sampleDir, targetPath))}`,
        `Write cache ${getDebugPath(args.cachePath)}`,
      ]
    );
  });
  return joinLines(lines);
}
