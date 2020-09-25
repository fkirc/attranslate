import { runTranslate, runTranslateExpectFailure } from "../test-util";
import { readUtf8File } from "../../src/util/util";

const helpRef = "test/help/help_reference.txt";

function getHelpReference(): string {
  return readUtf8File(helpRef);
}

test("reGenerateHelp", async () => {
  if (process.env.GENERATE_REFS) {
    await runTranslate(`--help > ${helpRef}`);
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
  expect(output).toBe(
    "error: required option '--src <sourceFile>' not specified\n"
  );
});

test("unknown command without options", async () => {
  const output = await runTranslateExpectFailure("fijsoijv");
  expect(output).toBe(
    "error: required option '--src <sourceFile>' not specified\n"
  );
});

test("unknown command with options", async () => {
  const output = await runTranslateExpectFailure(
    "jivduns --src=di --srcLng=en --dst=en --dstLng=zh"
  );
  expect(output).toBe(
    "error: unknown command 'jivduns'. See 'attranslate --help'.\n"
  );
});

test("unknown option without valid options", async () => {
  const output = await runTranslateExpectFailure("--version");
  expect(output).toBe(
    "error: required option '--src <sourceFile>' not specified\n"
  );
});

test("unknown option + valid options", async () => {
  const output = await runTranslateExpectFailure(
    "--version --src=di --srcLng=de --dst=da --dstLng=en"
  );
  expect(output).toBe("error: unknown option '--version'\n");
});
