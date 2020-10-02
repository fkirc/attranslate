import { CoreArgs, CoreResults, TSet } from "../../src/core/core-definitions";
import { translateCore } from "../../src/core/translate-core";

export const enSrc: TSet = new Map([
  ["one", "Content One"],
  ["two", "Content Two"],
  ["three", "Content Three"],
  ["four", "Content Four"],
  ["five", "Content Five"],
  ["six", "Content Six"],
]);

export const commonArgs: Omit<CoreArgs, "oldTarget" | "src" | "srcCache"> = {
  service: "google-translate",
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu",
  srcLng: "en",
  targetLng: "de",
};

export const deTarget: TSet = new Map([
  ["one", "Inhalt Eins"],
  ["two", "Inhalt Zwei"],
  ["three", "Inhalt Drei"],
  ["four", "Inhalt vier"],
  ["five", "Inhalt Fünf"],
  ["six", "Inhalt Sechs"],
]);

export async function translateCoreAssert(
  args: CoreArgs
): Promise<CoreResults> {
  return await translateCore(args);
}
