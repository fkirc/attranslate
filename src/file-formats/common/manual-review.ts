import { WriteTFileArgs } from "../file-format-definitions";

// This is a workaround because raw JSON does not allow any comments or additional metadata.
const jsonKeyManualReviewPostfix = "__reviewed";

export function addManualReviewToJSON(
  json: Record<string, string | null>,
  key: string,
  value: string | null,
  args: WriteTFileArgs
) {
  if (!args.manualReview) {
    return;
  }
  if (!value) {
    return;
  }
  const changeSet = args.changeSet;
  const needsReview = changeSet.added.has(key) || changeSet.updated.has(key);
  if (needsReview) {
    const reviewKey = `${key}${jsonKeyManualReviewPostfix}`;
    json[reviewKey] = getNotReviewedValue();
  }
}

export function isJsonKeyTranslatable(key: string): boolean {
  return !key.endsWith(jsonKeyManualReviewPostfix);
}

function getNotReviewedValue(): string {
  // We use string instead of boolean because we do not want to mess with external tools.
  return "false";
}
