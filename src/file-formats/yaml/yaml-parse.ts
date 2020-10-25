import { ReadTFileArgs } from "../file-format-definitions";
import { Document, Options, parseDocument } from "yaml";
import { logParseError } from "../common/parse-utils";
import Parsed = Document.Parsed;
import { readUtf8File } from "../../util/util";

export function parseYaml(args: ReadTFileArgs): Parsed {
  const ymlString = readUtf8File(args.path);
  const options: Options = {
    keepCstNodes: true,
    keepNodeTypes: true,
    keepUndefined: true,
    prettyErrors: true,
  };
  let document: Parsed;
  try {
    document = parseDocument(ymlString, options);
  } catch (e) {
    console.error(e);
    logParseError("YAML parsing error", args);
  }
  if (document.errors?.length) {
    const errorMsg = document.errors
      .map((e) => {
        e.makePretty();
        return e.message;
      })
      .join("\n");
    logParseError(errorMsg, args);
  }
  return document;
}
