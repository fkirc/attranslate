import {
  runTranslate,
  runTranslateExpectFailure,
} from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs, offlineMaxTime } from "./e2e-common";

test("--help", async () => {
  const output = await runTranslate(`--help`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output.includes('One of "openai",'));
});

test("-h", async () => {
  const output = await runTranslate(`-h`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output.includes('One of "openai",'));
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
  const output = await runTranslateExpectFailure("--garbageOption");
  expect(output).toBe(
    "error: required option '--srcFile <sourceFile>' not specified\n"
  );
});

test("unknown option + valid options", async () => {
  const validOptions = buildE2EArgs(defaultE2EArgs);
  const output = await runTranslateExpectFailure(
    `${validOptions} --garbageOption`
  );
  expect(output).toBe("error: unknown option '--garbageOption'\n");
});
