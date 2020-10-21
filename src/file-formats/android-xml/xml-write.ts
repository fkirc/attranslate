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
  const options: OptionsV2 = {
    xmldec: {
      version: "1.0",
      encoding: "utf-8",
      standalone: undefined,
    },
  };
  const builder: Builder = new xml2js.Builder(options);
  const rawXmlString: string = builder.buildObject(resourceFile);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prettifyXml = require("prettify-xml");
  const prettyXmlString = prettifyXml(rawXmlString, {
    indent,
  });
  const xmlString = `${prettyXmlString}\n`;
  writeUf8File(args.path, xmlString);
}
