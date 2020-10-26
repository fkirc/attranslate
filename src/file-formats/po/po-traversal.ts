import { GetTextTranslation, GetTextTranslations } from "gettext-parser";

export function traversePot(
  potFile: GetTextTranslations,
  operation: (getText: GetTextTranslation) => void
) {
  for (const outerKey of Object.keys(potFile.translations)) {
    const potEntry: { [msgId: string]: GetTextTranslation } =
      potFile.translations[outerKey];
    for (const innerKey of Object.keys(potEntry)) {
      const getText: GetTextTranslation = potEntry[innerKey];
      operation(getText);
    }
  }
}
