import { WriteTFileArgs } from "../file-format-definitions";
import {
  DEFAULT_XML_HEADER,
  DEFAULT_XML_INDENT,
  sharedXmlOptions,
  XmlAuxData,
  XmlFile,
} from "./xml-generic";
import { writeUtf8File } from "../../util/util";
import { Builder, OptionsV2 } from "xml2js";
import { constructJsonKey, traverseXml } from "./xml-traverse";

export function updateXmlContent(args: {
  args: WriteTFileArgs;
  sourceXml: XmlFile;
  oldTargetXml: XmlFile | null;
}) {
  traverseXml({
    xml: args.sourceXml,
    oldTargetXml: args.oldTargetXml,
    operation: (context, xmlTag) => {
      const key = constructJsonKey(context);
      const value = args.args.tSet.get(key);
      if (value !== undefined) {
        return value ?? "";
      }
      return null;
    },
  });
}

export function writeXmlResourceFile(
  xmlFile: XmlFile,
  args: WriteTFileArgs,
  auxData: XmlAuxData | null
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xml2js = require("xml2js");
  const stringIndent = " ".repeat(
    auxData?.detectedIntent ?? DEFAULT_XML_INDENT
  );
  const options: OptionsV2 = {
    ...sharedXmlOptions,
    headless: true,
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
  const rawXmlString: string = builder.buildObject(xmlFile);
  let xmlHeader: string = DEFAULT_XML_HEADER + "\n";
  if (auxData) {
    if (auxData.xmlHeader) {
      xmlHeader = auxData.xmlHeader + "\n";
    } else {
      xmlHeader = "";
    }
  }
  const xmlString = `${xmlHeader}${removeBlankLines(rawXmlString)}\n`;
  writeUtf8File(args.path, xmlString);
}

function removeBlankLines(str: string) {
  const lines = str.split("\n");
  const filteredLines = lines.filter((line) => {
    return line.trim().length >= 1;
  });
  return filteredLines.join("\n");
}
