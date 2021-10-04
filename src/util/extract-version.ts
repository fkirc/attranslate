import { join, resolve } from "path";
import { readFileSync } from "fs";

interface PackageJson {
  version: string;
}

export function extractVersion(args: { cliBinDir: string }): string {
  const rootDir = resolve(join(args.cliBinDir, ".."));
  try {
    const jsonStr = readFileSync(join(rootDir, "package.json"), {
      encoding: "utf8",
      flag: "r",
    });
    const packageJson: PackageJson = JSON.parse(jsonStr);
    return packageJson.version;
  } catch (e: unknown) {
    return (e as Error).toString() + "\nFailed to retrieve the version";
  }
}
