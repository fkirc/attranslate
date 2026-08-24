import { replaceLines, runSampleScript, sampleDir } from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { join } from "path";

const assetDir = "xml-generic";
const testScript = "./xml_generic.sh";
const mainTarget = join(assetDir, "de.xml");
const targetPaths: string[] = [join(assetDir, "ar.xml"), mainTarget];

test("xml clean", async () => {
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toBe(
    joinLines(
      targetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});

test("xml delete stale translations", async () => {
  replaceLines({
    path: join(sampleDir, mainTarget),
    search: "    </some-array>",
    replace: "    </some-array>\n<newstuff><nested>content</nested></newstuff>",
  });
  const output = await runSampleScript(testScript, [assetDir]);
  expect(output).toContain(`Delete 1 stale translations`);
});
