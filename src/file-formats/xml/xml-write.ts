import { WriteTFileArgs } from "../file-format-definitions";
import {
  DEFAULT_XML_HEADER,
  DEFAULT_XML_INDENT,
  sharedXmlOptions,
  XmlAuxData,
  XmlTag,
} from "./xml-generic";
import { writeUtf8File } from "../../util/util";
import { Builder, OptionsV2 } from "xml2js";
import {
  constructJsonKey,
  TraverseXmlContext,
  traverseXml,
} from "./xml-traverse";

export function updateXmlContent(args: {
  args: WriteTFileArgs;
  xmlFile: XmlTag;
}) {
  const context: TraverseXmlContext = {
    keyFragments: [],
    operation: (context, xmlTag) => {
      const key = constructJsonKey(context);
      const value = args.args.tSet.get(key);
      if (value !== undefined) {
        if (typeof xmlTag === "object") {
          xmlTag.characterContent = value ?? ""; // TODO: Update string-tags as well
        }
      }
    },
  };
  traverseXml({
    context,
    tag: args.xmlFile,
    oldTargetTag: null,
  });
}

// function writeUncachedTag(writeContext: XmlWriteContext) {
//   // TODO: Test and re-implement uncached XML-writing
//   const newTag: XmlTag = {
//     characterContent: writeContext.value ?? "",
//     attributes: {
//       [defaultKeyAttribute]: writeContext.jsonKey,
//     },
//   };
//   //insertRawResourceTag(writeContext, "string", newTag);
// }

// function insertCachedResourceTag(
//   writeContext: XmlWriteContext,
//   cacheEntry: XmlCacheEntry
// ) {
//   insertRawResourceTag(
//     writeContext,
//     cacheEntry.arrayName,
//     cacheEntry.parentTag
//   );
// }
//
// function insertRawResourceTag(
//   writeContext: XmlWriteContext,
//   arrayName: string,
//   tag: XmlTag
// ) {
//   const resources = writeContext.resources;
//   let xmlArray = resources[arrayName];
//   if (!Array.isArray(xmlArray)) {
//     xmlArray = [];
//     resources[arrayName] = xmlArray;
//   }
//   let tagFound = false;
//   for (const existingTag of xmlArray) {
//     if (existingTag === tag) {
//       tagFound = true;
//       break;
//     }
//   }
//   if (!tagFound) {
//     injectReviewAttribute(writeContext, tag);
//     xmlArray.push(tag);
//   }
// }

// TODO: Re-implement review attribute?
// function injectReviewAttribute(writeContext: XmlWriteContext, tag: XmlTag) {
//   if (
//     typeof tag === "object" &&
//     tag.attributes &&
//     needsReview(writeContext.args, writeContext.jsonKey, writeContext.value)
//   ) {
//     tag.attributes["reviewed"] = getNotReviewedValue();
//   }
// }

export function writeXmlResourceFile(
  xmlFile: XmlTag,
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
