import { WriteTFileArgs } from "../file-format-definitions";

export function getNotReviewedValue(): string {
  // We use string instead of boolean because we do not want to mess with external tools.
  return "false";
}

export function needsReview(
  args: WriteTFileArgs,
  key: string,
  value: string | null
): boolean {
  if (!args.manualReview) {
    return false;
  }
  if (!value) {
    return false;
  }
  const changeSet = args.changeSet;
  return changeSet.added.has(key) || changeSet.updated.has(key);
}
