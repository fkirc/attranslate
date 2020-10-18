import { runTranslate } from "../test-util/test-util";
import {
  docAssets,
  helpRef,
  readHelpReference,
  replaceReadme,
} from "./doc-utils";
import { join } from "path";
import { sampleDir } from "../e2e/scripts-e2e-util";
import { readUtf8File } from "../../src/util/util";

interface ReadmeSnippet {
  refPath: string;
  srcPath: string;
  firstLine: string;
}

const readmeSnippets: ReadmeSnippet[] = [
  {
    refPath: join(docAssets, "simple_translate.snippet"),
    srcPath: join(sampleDir, "simple_translate.sh"),
    firstLine: "attranslate ",
  },
  {
    refPath: join(docAssets, "multi_json.snippet"),
    srcPath: join(sampleDir, "json_manual_review.sh"),
    firstLine: "# This example ",
  },
];

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
