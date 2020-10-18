import { runTranslate } from "../test-util/test-util";
import { helpRef, readHelpReference, replaceReadme } from "./doc-utils";

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
