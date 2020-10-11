import { buildE2EArgs, defaultE2EArgs } from "./e2e-common";
import { joinLines, runTranslateExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";
import { CliArgs } from "../../src/core/core-definitions";

test("non existing gcloud-config", async () => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    serviceConfig: "not-existing-config",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    joinLines([
      `Invoke 'google-translate' from 'en' to 'de' with 3 inputs...`,
      `error: ${getDebugPath("not-existing-config")} does not exist.`,
    ])
  );
});

test("invalid azure-config", async () => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    service: "azure",
    serviceConfig: "invalid-api-key",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain("Invoke 'azure' from 'en' to 'de' with 3 inputs...");
  expect(output).toContain("Azure Translation failed");
  expect(output).toContain(
    "The request is not authorized because credentials are missing or invalid"
  );
});

test("invalid deepl-config", async () => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    service: "deepl",
    serviceConfig: "invalid-api-key",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toContain("Invoke 'deepl' from 'en' to 'de' with 3 inputs...");
  expect(output).toContain("DeepL.translateString");
  //expect(output).toContain("[403 Forbidden]: Empty body");
});

test("invalid gcloud-config", async () => {
  const args: CliArgs = {
    ...defaultE2EArgs,
    serviceConfig: "test-assets/invalid/empty.json",
  };
  const output = await runTranslateExpectFailure(buildE2EArgs(args));
  expect(output).toBe(
    joinLines([
      `Invoke 'google-translate' from 'en' to 'de' with 3 inputs...`,
      `error: ${getDebugPath(
        "test-assets/invalid/empty.json"
      )} does not contain a project_id`,
    ])
  );
});
