import { getDebugPath, logFatal, readUtf8File } from "../../util/util";
import { insertUtf8Cache, writeManagedUtf8 } from "./managed-utf8";

export function writeManagedJson(args: {
  path: string;
  object: unknown;
}): string {
  const jsonString = JSON.stringify(args.object, null, 2);
  return writeManagedUtf8({
    path: args.path,
    utf8: jsonString,
  });
}

export function readManagedJson<T>(path: string): Partial<T> {
  const { object, jsonString } = readRawJson<T>(path);
  insertUtf8Cache({ path, utf8: jsonString });
  return object;
}

export function readRawJson<T>(
  path: string
): { object: Partial<T>; jsonString: string } {
  try {
    const jsonString = readUtf8File(path);
    return { object: JSON.parse(jsonString) as Partial<T>, jsonString };
  } catch (e) {
    console.error(e);
    logFatal(`Failed to parse ${getDebugPath(path)}.`);
  }
}
