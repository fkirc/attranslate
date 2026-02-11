// AgentTranslation: minimal agent protocol for attranslate
// - First invocation (stdin is TTY): prints missing sources and agent instructions.
// - Second invocation (stdin is piped): reads translations, one per line, in order.

import { TResult, TService, TServiceArgs } from "./service-definitions";

function printMissingSources(strings: { key: string; value: string }[], useError = false) {
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
    if (process.stdin.isTTY) {
      printMissingSources(args.strings);
      console.log("\nINSTRUCTIONS FOR AGENTS:");
      console.log("Provide one translation per line, matching the order above. Pipe them into attranslate.");
      const cmd = process.argv.slice(2).join(" ");
      console.log(`echo -e \"<translation1>\\n<translation2>\\n...\" | attranslate ${cmd} --service=agent`);
      return results;
    }
    // Read piped stdin, split into lines, map to keys in order
    const stdin = await this.readAllStdin();
    const lines = stdin.replace(/\r/g, "").split("\n").filter(line => line.trim() !== "");
    const translationCount = args.strings.length;
    if (lines.length === 0) {
      printMissingSources(args.strings, true);
      console.error("ERROR: No translations provided. Pipe one translation per source listed above.");
      process.exit(1);
    }
    if (lines.length !== translationCount) {
      printMissingSources(args.strings, true);
      console.error(`ERROR: ${lines.length} translations given, ${translationCount} required. Provide exactly one translation per source listed above.`);
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


