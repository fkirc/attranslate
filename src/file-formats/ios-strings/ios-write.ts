import { WriteTFileArgs } from "../file-format-definitions";
import { LineChunk } from "./ios-strings";
import { VALUE_INDEX } from "./ios-read";
import { FormatCache } from "../common/format-cache";
import { writeManagedUtf8 } from "../common/managed-utf8";

export function writeiOSFile(
  args: WriteTFileArgs,
  cache: FormatCache<LineChunk, unknown>
) {
  const outLines: string[] = [];
  args.tSet.forEach((value, key) => {
    const oldChunk = cache.lookup({ path: args.path, key });
    let newChunk: LineChunk;
    if (oldChunk) {
      newChunk = convertOldChunkIntoNewChunk(oldChunk, value);
    } else {
      newChunk = createNewChunk(key, value);
    }
    outLines.push(...newChunk.lines);
  });
  outLines.push("\n");
  const output = outLines.join("\n");
  writeManagedUtf8({ path: args.path, utf8: output });
}

function createNewChunk(key: string, newValue: string | null): LineChunk {
  return {
    value: newValue,
    lines: ["", "", `"${key}" = "${newValue}";`],
  };
}

function convertOldChunkIntoNewChunk(
  oldChunk: LineChunk,
  newValue: string | null
): LineChunk {
  oldChunk.value = newValue;
  const valueLine = oldChunk.lines[oldChunk.lines.length - 1];
  const token = valueLine.split('"');
  token[VALUE_INDEX] = newValue ?? "";
  oldChunk.lines[oldChunk.lines.length - 1] = token.join('"');
  return oldChunk;
}
