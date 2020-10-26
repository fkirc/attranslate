import { WriteTFileArgs } from "../file-format-definitions";
import { LineChunk } from "./ios-strings";
import { VALUE_INDEX } from "./ios-read";
import { FormatCache } from "../common/format-cache";
import { getNotReviewedValue, needsReview } from "../common/manual-review";
import { writeManagedUtf8 } from "../common/managed-utf8";

const reviewPrefix = "// reviewed:";

function injectReviewComment(lineChunk: LineChunk) {
  const lines = lineChunk.lines;
  for (const line of lines) {
    if (line.startsWith(reviewPrefix)) {
      return; // Review-comment already there, avoid duplicates
    }
  }
  if (!lines.length) {
    return;
  }
  const linesBefore: string[] = lines.slice(0, lines.length - 1);
  const reviewLine = `${reviewPrefix} ${getNotReviewedValue()}`;
  const valueLine = lines[lines.length - 1];
  lineChunk.lines = [...linesBefore, reviewLine, valueLine];
}

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
    if (needsReview(args, key, value)) {
      injectReviewComment(newChunk);
    }
    outLines.push(...newChunk.lines);
  });
  outLines.push("\n\n");
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
