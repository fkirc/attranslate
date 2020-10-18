import { WriteTFileArgs } from "../file-format-definitions";
import { LineChunk } from "./ios-strings";
import { VALUE_INDEX } from "./ios-read";
import { writeUf8File } from "../../util/util";
import { FormatCache } from "../common/format-cache";

const DEFAULT_APPENDIX: string[] = ["\n"];

export function writeiOSFile(
  args: WriteTFileArgs,
  cache: FormatCache<LineChunk, string[]>
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
  const appendix = cache.lookupAuxdata({ path: args.path }) ?? DEFAULT_APPENDIX;
  outLines.push(...appendix);
  const output = outLines.join("\n");
  writeUf8File(args.path, output);
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
