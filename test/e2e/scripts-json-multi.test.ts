import { join } from "path";
import semver from "semver";
import { joinLines, runCommandExpectFailure } from "../test-util/test-util";
import { runSampleScript } from "./scripts-e2e-util";

test("json simple up-to-date", async () => {
  const output = await runSampleScript(`./json_simple.sh`, ["json-simple"]);
  expect(output).toBe("Target is up-to-date: 'json-simple/de.json'\n");
});

test("missing OpenAI key", async () => {
  const output =
    await runCommandExpectFailure(`cd sample-scripts && attranslate --srcFile=json-simple/en.json --srcLng=English --format=nested-json --targetFile=json-simple/es.json --targetLng=German --service=openai
  `);
  expect(output).toContain(
    "error: Missing OpenAI API Key: Please get an API key from"
  );
});

test("invalid OpenAI key", async () => {
  const output =
    await runCommandExpectFailure(`cd sample-scripts && attranslate --srcFile=json-simple/en.json --srcLng=English --format=nested-json --targetFile=json-simple/es.json --targetLng=German --service=openai --serviceConfig=garbageapikey
  `);
  expect(output).toContain(
    "error: OpenAI: Request failed with status code 401, Status text:"
  );
});

test("missing OpenAI key (typechat)", async () => {
  const output = await runCommandExpectFailure(
    `cd sample-scripts && attranslate --srcFile=json-simple/en.json --srcLng=English --format=nested-json --targetFile=json-simple/es.json --targetLng=German --service=typechat
  `,
    undefined,
    { ...process.env, OPENAI_API_KEY: undefined }
  );
  if (semver.satisfies(process.version, ">=18")) {
    expect(output).toContain(
      "error: Missing environment variable: OPENAI_API_KEY"
    );
  } else {
    expect(output).toContain("error: typechat requires node >=18");
  }
});

test("invalid OpenAI key (typechat)", async () => {
  const output = await runCommandExpectFailure(
    `cd sample-scripts && attranslate --srcFile=json-simple/en.json --srcLng=English --format=nested-json --targetFile=json-simple/es.json --targetLng=German --service=typechat
  `,
    undefined,
    { ...process.env, OPENAI_API_KEY: "garbageapikey" }
  );
  if (semver.satisfies(process.version, ">=18")) {
    expect(output).toContain("error: REST API error 401: Unauthorized");
  } else {
    expect(output).toContain("error: typechat requires node >=18");
  }
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
