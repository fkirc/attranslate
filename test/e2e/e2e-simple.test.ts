import { runCommand, runTranslate } from "../test-util";

describe.each([
  {
    src: "test-assets/hello-en-flat.json",
    target: "test-assets/hello-de-flat.json",
  },
  {
    src: "test-assets/hello-en-nested.json",
    target: "test-assets/hello-de-nested.json",
  },
])("simple translate", (args) => {
  const commonArgs = `--srcFile='${args.src}' --srcLng='en' --targetFile='${args.target}' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'`;

  test("up-to-date cache, up-to-date target", async () => {
    const output = await runTranslate(commonArgs);
    expect(output).toBe("Nothing changed, translations are up-to-date.\n");
  });

  test("up-to-date cache, missing target", async () => {
    await runCommand(`rm ${args.target}`);
    const output = await runTranslate(commonArgs);
    expect(output).toContain("Add 3 new translations");
    expect(output).toContain("Write target-file");
  });
});
