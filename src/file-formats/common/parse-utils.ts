import { ReadTFileArgs } from "../file-format-definitions";
import { getDebugPath, logFatal } from "../../util/util";

export function logParseError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to parse ${getDebugPath(
    args.path
  )} with expected format '${args.format}': ${rawMsg}`;
  logFatal(msg);
}

export function logParseWarning(rawMsg: string, args: ReadTFileArgs) {
  const msg = `Warning: Parsing '${args.path}': ${rawMsg}`;
  console.log(msg);
}
