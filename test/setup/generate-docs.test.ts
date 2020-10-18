import { runTranslate } from "../test-util/test-util";
import {
  helpRef,
  readHelpReference,
  ReadmeSnippet,
  readmeSnippets,
  replaceReadme,
} from "./doc-utils";
import { readUtf8File, writeUf8File } from "../../src/util/util";

function extractNewReadmeSnippet(snippet: ReadmeSnippet): string {
  const script = readUtf8File(snippet.srcPath);
  const lines: string[] = script.split("\n");
  const snippetLines: string[] = [];
  let snippetFound = false;
  lines.forEach((line) => {
    if (line.startsWith(snippet.firstLine)) {
      snippetFound = true;
    }
    if (snippetFound) {
      snippetLines.push(line);
    }
  });
  expect(snippetLines.length).toBeGreaterThanOrEqual(1);
  return snippetLines.join("\n");
}

function generateReadmeSnippet(snippet: ReadmeSnippet) {
  const oldSnippet = readUtf8File(snippet.refPath);
  const newSnippet = extractNewReadmeSnippet(snippet);
  replaceReadme(oldSnippet, newSnippet);
  writeUf8File(snippet.refPath, newSnippet);
}

test("generate README snippets", () => {
  if (process.env.GENERATE_REFS) {
    readmeSnippets.forEach((snippet) => generateReadmeSnippet(snippet));
  } else {
    console.info("Skipped");
  }
});

test("reGenerateHelp", async () => {
  if (process.env.GENERATE_REFS) {
    const oldHelpRef = readHelpReference();
    await runTranslate(`--help > ${helpRef}`);
    const newHelpRef = readHelpReference();
    replaceReadme(oldHelpRef, newHelpRef);
  } else {
    console.info("Skipped");
  }
});
