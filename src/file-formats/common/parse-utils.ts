import { ReadTFileArgs } from "../file-format-definitions";
import { getDebugPath, logFatal } from "../../util/util";

export function logParseError(rawMsg: string, args: ReadTFileArgs): never {
  const msg = `Failed to parse ${getDebugPath(args.path)}: ${rawMsg}`;
  logFatal(msg);
}
