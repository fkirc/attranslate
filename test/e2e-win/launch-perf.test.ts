import {
  buildTranslateCommand,
  runCommandTimeout,
} from "../test-util/test-util";

test("performance of --help", async () => {
  const runs = 10;
  const helpCmd = buildTranslateCommand("--help");
  const batchCmds: string[] = [];
  for (let i = 0; i < runs; i++) {
    batchCmds.push(helpCmd);
  }
  const cmdChain = batchCmds.join(" && ");
  const output = await runCommandTimeout(cmdChain, { maxTime: 2500 });
  expect(countOccurrences(output, "Usage: attranslate [options]")).toBe(runs);
});

function countOccurrences(content: string, pattern: string): number {
  return content.split(pattern).length - 1;
}
