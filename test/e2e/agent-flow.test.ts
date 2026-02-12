import { join } from "path";
import {
  buildTranslateCommand,
  generateId,
  runCommand,
} from "../test-util/test-util";
import { buildE2EArgs, defaultE2EArgs, E2EArgs } from "./e2e-common";

(process.platform === "win32" ? describe.skip : describe)("agent flow", () => {
  const fixtureDir = "test-assets/misc-json/agent-flow";
  const srcFile = join(fixtureDir, "en.json");
  const seedTargetFile = join(fixtureDir, "de.seed.json");
  const expectedTargetFile = join(fixtureDir, "de.expected.json");

  function newRandomTargetFile(): string {
    return join(fixtureDir, `de_random_target_${generateId()}.json`);
  }

  const args: E2EArgs = {
    ...defaultE2EArgs,
    srcFile,
    srcLng: "English",
    // Use new single-format flag. (Disable legacy src/target format args)
    srcFormat: undefined,
    targetFormat: undefined,
    format: "json",
    targetFile: "",
    refTargetFile: "default-ref-target",
    targetLng: "German",
    service: "agent",
    serviceConfig: undefined,
    matcher: "none",
  };

  let targetFile: string;

  beforeEach(async () => {
    targetFile = newRandomTargetFile();
    await runCommand(`cp ${seedTargetFile} ${targetFile}`);
  });

  afterEach(async () => {
    await runCommand(`rm -f ${targetFile}`);
  });

  test("part 1 (without pipe): prints missing translations and exits", async () => {
    const cmd = buildTranslateCommand(buildE2EArgs({ ...args, targetFile }, true));

    const output = await runCommand(`ATTRANSLATE_AGENT_TTY=1 ${cmd}`);

    expect(output).toContain("MISSING TRANSLATIONS:");
    expect(output).toContain("- key: bye");
    expect(output).toContain("- key: __agent_test_key");
    expect(output).toContain("INSTRUCTIONS FOR AGENTS:");

    // Ensure the agent's first run didn't modify the target file.
    await runCommand(`diff ${seedTargetFile} ${targetFile}`);
  });

  test("part 2 (piped): consumes stdin and writes translations", async () => {
    // Order must match the printed order (bye, __agent_test_key)
    const cmd = buildTranslateCommand(buildE2EArgs({ ...args, targetFile }, true));
    const output = await runCommand(
      `printf 'Tschüss\\nHallo vom Agenten\\n' | ${cmd}`
    );
    expect(output).toContain("Write target");

    await runCommand(`diff ${expectedTargetFile} ${targetFile}`);
  });
});
