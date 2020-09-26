import { TSet } from "../../src/core/core-definitions";
import { CoreArgs, CoreResults } from "../../src/core/translate-core";

export const enSrc: TSet = {
  lng: "en",
  translations: new Map([
    ["hello", "Hello"],
    ["world", "World"],
    ["attranslate", "Automated Text Translator"],
    ["value", "Translate within seconds"],
    ["outcome", "No more slowdowns"],
    ["getStarted", "Get started within minutes"],
  ]),
};

export const commonArgs: Omit<CoreArgs, "oldTarget" | "srcCache"> = {
  src: enSrc,
  service: "google-translate", // TODO: Type safety
  serviceConfig: "gcloud/gcloud_service_account.json",
  matcher: "icu", // TODO: Type safete
  targetLng: "de",
};

export const germanTarget: TSet = {
  lng: "de",
  translations: new Map([
    ["hello", "Hallo"],
    ["world", "Welt"],
    ["attranslate", "Automatisierter Textübersetzer"],
    ["value", "Innerhalb von Sekunden übersetzen"],
    ["outcome", "Keine Verlangsamungen mehr"],
    ["getStarted", "Beginnen Sie innerhalb von Minuten"],
  ]),
};

export const commonResult: Omit<CoreResults, "countNew" | "countUpdated"> = {
  newTarget: germanTarget,
};
