import { WriteTFileArgs } from "../file-format-definitions";
import { XmlResourceFile } from "./android-xml";
import { writeUf8File } from "../../util/util";
import { Builder, OptionsV2 } from "xml2js";

export function writeXmlResourceFile(
  resourceFile: XmlResourceFile,
  args: WriteTFileArgs,
  indent: number
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xml2js = require("xml2js");
  const stringIndent = " ".repeat(indent);
  const options: OptionsV2 = {
    xmldec: {
      version: "1.0",
      encoding: "utf-8",
      standalone: undefined,
    },
    renderOpts: {
      pretty: true,
      indent: stringIndent,
    },
  };
  // See https://github.com/oozcitak/xmlbuilder-js/wiki/Builder-Options for available xmlBuilderOptions
  const xmlBuilderOptions = {
    noValidation: false,
    noDoubleEncoding: true,
  };
  const mergedOptions = { ...options, xmlBuilderOptions };
  const builder: Builder = new xml2js.Builder(mergedOptions);
  const rawXmlString: string = builder.buildObject(resourceFile);
  const xmlString = `${rawXmlString}\n`;
  writeUf8File(args.path, xmlString);
}
