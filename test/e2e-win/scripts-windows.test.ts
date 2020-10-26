import { runSampleScript } from "../e2e/scripts-e2e-util";

test("json simple windows", async () => {
  if (process.platform !== "win32") {
    return;
  }
  const output = await runSampleScript(`json_simple_windows.bat`, ["json-raw"]);
  expect(output).toContain("Target is up-to-date: 'json-raw/fruits-de.json'\n");
});
