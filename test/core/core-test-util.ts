import { CoreArgs, TSet } from "../../src/core/core-definitions";

export const enSrc: TSet = {
  lng: "en",
  translations: new Map([
    ["one", "Content One"],
    ["two", "Content Two"],
    ["three", "Content Three"],
    ["four", "Content Four"],
    ["five", "Content Five"],
    ["six", "Content Six"],
  ]),
};

export const commonArgs: Omit<CoreArgs, "oldTarget" | "src" | "srcCache"> = {
  service: "google-translate",
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu",
  targetLng: "de",
};

export const deTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["one", "Inhalt Eins"],
    ["two", "Inhalt Zwei"],
    ["three", "Inhalt Drei"],
    ["four", "Inhalt Vier"],
    ["five", "Inhalt Fünf"],
    ["six", "Inhalt Sechs"],
  ]),
};
