import { ReadTFileArgs, WriteTFileArgs } from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";

export function readJsonProp(
  key: string,
  value: string | null,
  tSet: TSet,
  args: ReadTFileArgs
) {
  tSet.set(key, value);
}

export function writeJsonProp(
  json: Record<string, string | null>,
  key: string,
  value: string | null,
  args: WriteTFileArgs
) {
  json[key] = value;
}
