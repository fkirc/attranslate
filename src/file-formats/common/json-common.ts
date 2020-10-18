import { ReadTFileArgs, WriteTFileArgs } from "../file-format-definitions";
import { FormatCache } from "./format-cache";
import { TSet } from "../../core/core-definitions";

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
  if (!args.manualReview) {
    return;
  }
  if (!value) {
    return;
  }
  const changeSet = args.changeSet;
  const needsReview = changeSet.added.has(key) || changeSet.updated.has(key);
  if (needsReview) {
    json[reviewKey(key)] = getNotReviewedValue();
  }
}

function getNotReviewedValue(): string {
  // We use string instead of boolean because we do not want to mess with external tools.
  return "false";
}
