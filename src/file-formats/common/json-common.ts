import { ReadTFileArgs, WriteTFileArgs } from "../file-format-definitions";
import { FormatCache } from "./format-cache";
import { TSet } from "../../core/core-definitions";
import { getNotReviewedValue, needsReview } from "./manual-review";

const reviewCache = new FormatCache<string | null, void>();

// This is a workaround because raw JSON does not allow any comments or additional metadata.
const jsonKeyManualReviewPostfix = "__reviewed";

export function readJsonProp(
  key: string,
  value: string | null,
  tSet: TSet,
  args: ReadTFileArgs
) {
  if (!key.endsWith(jsonKeyManualReviewPostfix)) {
    tSet.set(key, value);
  } else {
    reviewCache.insert({ path: args.path, key, entry: value });
  }
}

function reviewKey(jsonKey: string) {
  return `${jsonKey}${jsonKeyManualReviewPostfix}`;
}

export function writeJsonProp(
  json: Record<string, string | null>,
  key: string,
  value: string | null,
  args: WriteTFileArgs
) {
  json[key] = value;

  const oldReview = reviewCache.lookup({
    path: args.path,
    key: reviewKey(key),
  });
  if (oldReview) {
    json[reviewKey(key)] = oldReview;
    return;
  }
  if (needsReview(args, key, value)) {
    json[reviewKey(key)] = getNotReviewedValue();
  }
}
