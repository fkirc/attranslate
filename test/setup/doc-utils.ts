import { readUtf8File, writeUtf8File } from "../../src/util/util";
import { join } from "path";
import { sampleDir } from "../e2e/scripts-e2e-util";
export const docAssets = join("test-assets", "doc-assets");

export const helpRef = join(docAssets, "help_reference.txt");

export interface ReadmeSnippet {
  refPath: string;
  srcPath: string;
  firstLine: string;
}

export const readmeSnippets: ReadmeSnippet[] = [
  {
    refPath: join(docAssets, "simple_translate.snippet"),
    srcPath: join(sampleDir, "json_simple.sh"),
    firstLine: "attranslate ",
  },
  {
    refPath: join(docAssets, "multi_json.snippet"),
    srcPath: join(sampleDir, "json_advanced.sh"),
    firstLine: "# This example ",
  },
];

export function readHelpReference(): string {
  return readUtf8File(helpRef);
}

export function replaceReadme(search: string, replace: string) {
  const oldReadme = readUtf8File("README.md");
  const newReadme = oldReadme.replace(search, replace);
  writeUtf8File("README.md", newReadme);
}
