import {
  runTranslate,
  runTranslateExpectFailure,
} from "../test-util/test-util";
import { readUtf8File, writeUf8File } from "../../src/util/util";
import { buildE2EArgs, defaultE2EArgs, offlineMaxTime } from "./e2e-common";

const helpRef = "test-assets/help_reference.txt";

function getHelpReference(): string {
  return readUtf8File(helpRef);
}

test("reGenerateHelp", async () => {
  if (process.env.GENERATE_REFS) {
    const oldHelpRef = getHelpReference();
    const oldReadme = readUtf8File("README.md");
    await runTranslate(`--help > ${helpRef}`);
    const newHelpRef = getHelpReference();
    const newReadme = oldReadme.replace(oldHelpRef, newHelpRef);
    writeUf8File("README.md", newReadme);
  } else {
    console.info("Skipped");
  }
});

test("ensure that README is up-to-date", () => {
  const readme = readUtf8File("README.md");
  const helpOutput = readUtf8File(helpRef);
  expect(readme).toContain(helpOutput);
});

test("--help", async () => {
  const output = await runTranslate(`--help`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output).toBe(getHelpReference());
});

test("-h", async () => {
  const output = await runTranslate(`-h`, {
    pwd: "/",
    maxTime: offlineMaxTime,
  });
  expect(output).toBe(getHelpReference());
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
