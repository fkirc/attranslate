// AgentTranslation: minimal agent protocol for attranslate
// - First invocation (stdin is TTY): prints missing sources and agent instructions.
// - Second invocation (stdin is piped): reads translations, one per line, in order.

import { TResult, TService, TServiceArgs } from "./service-definitions";

function printMissingSources(
  strings: TServiceArgs["strings"],
  useError = false,
) {
  const log = useError ? console.error : console.log;
  log("MISSING TRANSLATIONS:\n");
  for (const { key, value } of strings) {
    log(`- key: ${key}`);
    log(`  source: ${value}\n`);
  }
}

export class AgentTranslation implements TService {
  async translateStrings(args: TServiceArgs) {
    const results: TResult[] = [];
    if (process.stdin.isTTY || process.env.ATTRANSLATE_AGENT_TTY === "1") {
      printMissingSources(args.strings);
      console.log("INSTRUCTIONS FOR AGENTS:");
      console.log(
        "Provide one translation per line, matching the order above. Pipe them into attranslate.",
      );
      const cmd = process.argv.slice(2).join(" ");
      console.log(
        `echo -e \"<translation1>\\n<translation2>\\n...\" | attranslate ${cmd}`
      );
      // Non-zero exit code by design: allows CI/CD or tooling to detect "missing translations".
      process.exit(2);
    }
    // Read piped stdin, split into lines, map to keys in order
    const stdin = await this.readAllStdin();
    const translationCount = args.strings.length;

    // Explicitly handle the case where nothing was piped at all.
    // (Empty lines are allowed as empty-string translations; this only triggers for truly empty stdin.)
    if (stdin.length === 0 && translationCount > 0) {
      printMissingSources(args.strings, true);
      console.error(
        "ERROR: No translations provided. Pipe one translation per source listed above.",
      );
      process.exit(1);
    }

    // Keep empty lines (empty translations) intact.
    // Only trim *trailing* empty lines which can occur due to a trailing newline.
    const lines = stdin.replace(/\r/g, "").split("\n");
    while (lines.length > translationCount && lines[lines.length - 1] === "") {
      lines.pop();
    }

    // Note: `split("\n")` never returns `[]`, so we don't need a separate `lines.length === 0` check.
    if (lines.length !== translationCount) {
      printMissingSources(args.strings, true);
      console.error(
        `ERROR: ${lines.length} translations given, ${translationCount} required. Provide exactly one translation per source listed above.`,
      );
      process.exit(1);
    }
    for (let i = 0; i < translationCount; i++) {
      results.push({ key: args.strings[i].key, translated: lines[i] });
    }
    return results;
  }
  private async readAllStdin(): Promise<string> {
    return new Promise((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
    });
  }
}
