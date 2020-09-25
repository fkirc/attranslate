import { flatten } from "./flatten";
import { resolve } from "path";

export type FileType = "key-based" | "natural" | "auto";

// TODO: Rewrite or remove
// export const detectFileType = (json: never): FileType => {
//   const invalidKeys = Object.keys(json).filter(
//     (k) => typeof json[k] === "string" && (k.includes(".") || k.includes(" "))
//   );
//
//   return invalidKeys.length > 0 ? "natural" : "key-based";
// };

export function loadTranslations(path: string) {
  const type: FileType = "key-based"; // TODO: Rewrite or remove
  return {
    name: path,
    originalContent: resolve(path),
    type,
    content: flatten(resolve(path)),
  };
}

// TODO: Rewrite or remove
/*export const fixSourceInconsistencies = (
  directory: string,
  cacheDir: string
) => {
  const files = loadTranslations(directory).filter((f) => f.type === "natural");

  for (const file of files) {
    const fixedContent = Object.keys(file.content).reduce(
      (acc, cur) => ({ ...acc, [cur]: cur }),
      {} as { [k: string]: string }
    );

    fs.writeFileSync(
      path.resolve(directory, file.name),
      JSON.stringify(fixedContent, null, 2) + "\n"
    );

    fs.writeFileSync(
      path.resolve(cacheDir, file.name),
      JSON.stringify(fixedContent, null, 2) + "\n"
    );
  }
};*/
