import { WriteTFileArgs } from "../file-format-definitions";
import { XmlResourceFile } from "./android-xml";
import { writeUf8File } from "../../util/util";

export function writeXmlResourceFile(
  resourceFile: XmlResourceFile,
  args: WriteTFileArgs,
  indent: number
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xml2js = require("xml2js").Builder();
  const rawXmlString: string = xml2js.buildObject(resourceFile);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prettifyXml = require("prettify-xml");
  const prettyXmlString = prettifyXml(rawXmlString, {
    indent,
  });
  const xmlString = `<?xml version="1.0" encoding="utf-8"?>\n${prettyXmlString}\n`;
  writeUf8File(args.path, xmlString);
}
