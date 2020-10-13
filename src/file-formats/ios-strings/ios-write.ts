import { WriteTFileArgs } from "../file-format-definitions";
import { LineChunk } from "./ios-strings";
import { lookupAppendix, lookupLineChunk } from "./ios-cache";
import { VALUE_INDEX } from "./ios-read";
import { writeUf8File } from "../../util/util";

export function writeiOSFile(args: WriteTFileArgs) {
  // const outFile: iOSFile = {
  //   path: args.path,
  //   chunks: new Map(),
  // };
  const outLines: string[] = [];
  args.tSet.forEach((value, key) => {
    const oldChunk = lookupLineChunk(key, args);
    let newChunk: LineChunk;
    if (oldChunk) {
      newChunk = convertOldChunkIntoNewChunk(oldChunk, value);
    } else {
      newChunk = createNewChunk(key, value);
    }
    outLines.push(...newChunk.lines);
  });
  outLines.push(...lookupAppendix());
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
