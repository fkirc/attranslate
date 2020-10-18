import {
  runTranslate,
  runTranslateExpectFailure,
} from "../test-util/test-util";
import { readUtf8File } from "../../src/util/util";
import { buildE2EArgs, defaultE2EArgs, offlineMaxTime } from "./e2e-common";
import { readHelpReference } from "../setup/doc-utils";

test("ensure that README is up-to-date", () => {
  const readme = readUtf8File("README.md");
  expect(readme).toContain(readHelpReference());
});

test("--help", async () => {
  const output = await runTranslate(`--help`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output).toBe(readHelpReference());
});

test("-h", async () => {
  const output = await runTranslate(`-h`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output).toBe(readHelpReference());
});

test("no arguments", async () => {
  const output = await runTranslateExpectFailure("");
  expect(output).toBe(
    "error: required option '--srcFile <sourceFile>' not specified\n"
  );
});

test("unknown command without options", async () => {
  const output = await runTranslateExpectFailure("fijsoijv");
  expect(output).toBe(
    "error: required option '--srcFile <sourceFile>' not specified\n"
  );
});

test("unknown command with options", async () => {
  const validOptions = buildE2EArgs(defaultE2EArgs);
  const output = await runTranslateExpectFailure(`jivduns ${validOptions}`);
  expect(output).toBe(
    "error: unknown command 'jivduns'. See 'attranslate --help'.\n"
  );
});

test("unknown option without valid options", async () => {
  const output = await runTranslateExpectFailure("--version");
  expect(output).toBe(
    "error: required option '--srcFile <sourceFile>' not specified\n"
  );
});

test("unknown option + valid options", async () => {
  const validOptions = buildE2EArgs(defaultE2EArgs);
  const output = await runTranslateExpectFailure(`${validOptions} --version`);
  expect(output).toBe("error: unknown option '--version'\n");
});
