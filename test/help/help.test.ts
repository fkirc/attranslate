import { runTranslate, runTranslateExpectFailure } from "../test-util";
import { readUtf8File } from "../../src/util/util";

function getHelpReference(): string {
  return readUtf8File("test/help/help_reference.txt");
}

test("--help", async () => {
  const output = await runTranslate(`--help`, "/");
  expect(output).toBe(getHelpReference());
});

test("-h", async () => {
  const output = await runTranslate(`-h`, "/");
  expect(output).toBe(getHelpReference());
});

test("no arguments", async () => {
  const output = await runTranslateExpectFailure("");
  expect(output).toBe(getHelpReference());
});

test("unknown command", async () => {
  const output = await runTranslateExpectFailure("fijsoijv");
  expect(output).toBe(
    "error: unknown command 'fijsoijv'. See 'attranslate --help'.\n"
  );
});

test("unknown option", async () => {
  const output = await runTranslateExpectFailure("--version");
  expect(output).toBe("error: unknown option '--version'\n");
});
