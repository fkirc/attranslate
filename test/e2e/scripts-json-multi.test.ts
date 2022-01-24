import { joinLines } from "../test-util/test-util";
import { modifyJsonProperty } from "./e2e-common";
import { getDebugPath } from "../../src/util/util";
import { runSampleScript, sampleDir } from "./scripts-e2e-util";
import { join } from "path";

test("json simple", async () => {
  const output = await runSampleScript(`./json_simple.sh`, ["json-simple"]);
  expect(output).toBe("Target is up-to-date: 'json-simple/de.json'\n");
});

const targetLngs = ["es", "zh", "de"];

const assetDir = "json-advanced";

function jsonTargetPaths(): string[] {
  return targetLngs.map((targetLng) => {
    return join(assetDir, targetLng, "fruits.json");
  });
}
const overwriteOutdatedTargets = jsonTargetPaths().slice(1);

function removeFirstLine(lines: string): string {
  return lines.substring(lines.indexOf("\n") + 1);
}

async function runMultiJSON(): Promise<string> {
  const rawOutput = await runSampleScript(`./json_advanced.sh`, [assetDir]);
  return removeFirstLine(rawOutput);
}

test("multi_json clean", async () => {
  const output = await runMultiJSON();
  expect(output).toBe(
    joinLines(
      jsonTargetPaths().map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("multi_json propagate updates to null-targets", async () => {
  overwriteOutdatedTargets.forEach((targetPath) => {
    modifyJsonProperty({
      jsonPath: join(sampleDir, targetPath),
      index: 0,
      newValue: null,
    });
  });

  const expectOutput = expectedUpdateOutput();
  const output = await runMultiJSON();
  expect(output).toBe(expectOutput);
});

function expectedUpdateOutput(): string {
  const lines: string[] = [];
  lines.push("Target is up-to-date: 'json-advanced/es/fruits.json'");
  overwriteOutdatedTargets.forEach((targetPath, index) => {
    const recv = `Invoke 'google-translate' from 'en' to '${
      targetLngs[index + 1]
    }' with 1 inputs...`;
    lines.push(
      ...[
        recv,
        "Add 1 new translations",
        `Write target ${getDebugPath(join(sampleDir, targetPath))}`,
      ]
    );
  });
  return joinLines(lines);
}
