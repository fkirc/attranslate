import { runSampleScript, sampleDir } from "./scripts-e2e-util";
import { joinLines } from "../test-util/test-util";
import { unlinkSync } from "fs";
import { join } from "path";
import { getDebugPath } from "../../src/util/util";

const flutterAssetDir = "flutter";

const flutterTargetPaths: string[] = [
  "flutter/lib/l10n/intl_es.arb",
  "flutter/lib/l10n/intl_de.arb",
];

test("Flutter clean", async () => {
  const output = await runSampleScript(`./flutter.sh`, [flutterAssetDir]);
  expect(output).toBe(
    joinLines(
      flutterTargetPaths.map((path) => {
        return `Target is up-to-date: '${path}'`;
      })
    )
  );
});
