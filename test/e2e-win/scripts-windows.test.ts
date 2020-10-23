import { runSampleScript } from "../e2e/scripts-e2e-util";

test("simple_translate_windows", async () => {
  if (process.platform !== "win32") {
    return;
  }
  const output = await runSampleScript(`simple_translate_windows.bat`, [
    "json-raw",
  ]);
  expect(output).toContain("Target is up-to-date: 'json-raw/fruits-de.json'\n");
});
