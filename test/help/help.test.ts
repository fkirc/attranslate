import { runTranslate, runTranslateExpectFailure } from "../test-util";
import { readUtf8File } from "../../src/util/util";

const helpRef = "test/help/help_reference.txt";

function getHelpReference(): string {
  return readUtf8File(helpRef);
}

test("reGenerateHelp", async () => {
  if (process.env.GENERATE_REFS) {
    await runTranslate(`--help 2> ${helpRef}`);
  } else {
    console.log("Skipped");
  }
});

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
  expect(output).toBe("error: required option '--src' not specified\n");
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
