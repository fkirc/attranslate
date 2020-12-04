import {
  ReadTFileArgs,
  TFileFormat,
  WriteTFileArgs,
} from "../file-format-definitions";
import { TSet } from "../../core/core-definitions";
import { logParseError } from "../common/parse-utils";
import { readManagedUtf8, writeManagedUtf8 } from "../common/managed-utf8";

// We might make this configurable if the need arises.
const CSV_SEPARATOR = ",";

interface CsvStruct {
  rawHeader: string;
  languageIndex: number;
  contentLines: string[];
}

function parseCsvStruct(args: {
  utf8: string;
  args: ReadTFileArgs;
}): CsvStruct {
  const lines: string[] = args.utf8.split("\n");
  if (!lines || lines.length < 2) {
    logParseError(
      "Expected at least 2 CSV lines (header + content)",
      args.args
    );
  }
  const rawHeader = lines[0];
  const header: string[] = rawHeader.split(CSV_SEPARATOR);
  if (!header || header.length < 2) {
    logParseError(
      `Expected at least 2 columns in CSV header with separator '${CSV_SEPARATOR}'`,
      args.args
    );
  }
  const languageCodes = header.slice(1);
  const languageIndex =
    1 + languageCodes.findIndex((value) => value === args.args.lng);
  if (languageIndex <= 0) {
    logParseError(
      `Did not find language '${args.args.lng}' in CSV header '${rawHeader}'`,
      args.args
    );
  }
  const contentLines = lines.slice(1);
  return {
    rawHeader,
    languageIndex,
    contentLines,
  };
}

export class SimpleCsv implements TFileFormat {
  readTFile(args: ReadTFileArgs): Promise<TSet> {
    const utf8 = readManagedUtf8(args.path);
    const csvStruct = parseCsvStruct({ utf8, args });

    const tSet: TSet = new Map();
    csvStruct.contentLines.forEach((line) => {
      const tokens: string[] = line.split(CSV_SEPARATOR);
      if (tokens.length <= csvStruct.languageIndex) {
        return;
      }
      const key = tokens[0];
      const value = tokens[csvStruct.languageIndex];
      if (tSet.has(key)) {
        logParseError(
          `duplicate key '${key}' -> Currently, the usage of duplicate translation-keys is discouraged.`,
          args
        );
      }
      tSet.set(key, value);
    });
    return Promise.resolve(tSet);
  }

  writeTFile(args: WriteTFileArgs): void {
    console.log(
      "Warning: Currently, 'attranslate' may overwrite pre-existing CSV-content. This might change in future versions."
    );
    const lines: string[] = [];
    const header: string = ["keys", args.lng].join(CSV_SEPARATOR);
    lines.push(header);
    args.tSet.forEach((value, key) => {
      lines.push([key, value].join(CSV_SEPARATOR));
    });
    const csv: string = lines.join("\n");
    writeManagedUtf8({ path: args.path, utf8: csv });
  }
}
