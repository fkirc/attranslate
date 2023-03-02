import { joinLines } from "../test-util/test-util";
import { runSampleScript } from "./scripts-e2e-util";
import { join } from "path";

test("json simple up-to-date", async () => {
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
