import { WriteTFileArgs } from "../file-format-definitions";
import {
  DEFAULT_XML_HEADER,
  DEFAULT_XML_INDENT,
  NamedXmlTag,
  sharedXmlOptions,
  XmlAuxData,
  XmlCacheEntry,
  XmlResourceFile,
  XmlTag,
} from "./android-xml";
import { writeUf8File } from "../../util/util";
import { Builder, OptionsV2 } from "xml2js";
import { getNotReviewedValue, needsReview } from "../common/manual-review";

export interface XmlWriteContext {
  args: WriteTFileArgs;
  resourceFile: XmlResourceFile;
  cacheEntry: XmlCacheEntry | null;
  jsonKey: string;
  value: string | null;
}

export function writeResourceTag(writeContext: XmlWriteContext) {
  const cacheEntry = writeContext.cacheEntry;
  if (!cacheEntry) {
    return writeUncachedTag(writeContext);
  }
  switch (cacheEntry.type) {
    case "STRING_ARRAY":
      return writeStringArrayTag(writeContext, cacheEntry);
    case "NESTED":
      return writeNestedTag(writeContext, cacheEntry);
    case "FLAT":
      return writeFlatTag(writeContext, cacheEntry);
  }
}

function writeFlatTag(
  writeContext: XmlWriteContext,
  cacheEntry: XmlCacheEntry
) {
  const parentTag = cacheEntry.parentTag;
  parentTag.characterContent = writeContext.value ?? "";
  insertCachedResourceTag(writeContext, cacheEntry);
}

const survivingTags: Set<NamedXmlTag> = new Set();

function writeStringArrayTag(
  writeContext: XmlWriteContext,
  cacheEntry: XmlCacheEntry
) {
  const parentTag = cacheEntry.parentTag;
  parentTag.characterContent = "";
  if (!parentTag.item || !survivingTags.has(parentTag)) {
    parentTag.item = [];
    survivingTags.add(parentTag);
  }
  parentTag.item.push((writeContext.value ?? "") as string & XmlTag);
  insertCachedResourceTag(writeContext, cacheEntry);
}

function writeNestedTag(
  writeContext: XmlWriteContext,
  cacheEntry: XmlCacheEntry
) {
  cacheEntry.parentTag.characterContent = "";
  const childTag = cacheEntry.childTag;
  if (childTag) {
    childTag.characterContent = writeContext.value ?? "";
  }
  insertCachedResourceTag(writeContext, cacheEntry);
}

function writeUncachedTag(writeContext: XmlWriteContext) {
  const newTag: NamedXmlTag = {
    characterContent: writeContext.value ?? "",
    attributes: {
      name: writeContext.jsonKey,
    },
  };
  insertRawResourceTag(writeContext, "string", newTag);
}

function insertCachedResourceTag(
  writeContext: XmlWriteContext,
  cacheEntry: XmlCacheEntry
) {
  insertRawResourceTag(
    writeContext,
    cacheEntry.arrayName,
    cacheEntry.parentTag
  );
}

function insertRawResourceTag(
  writeContext: XmlWriteContext,
  arrayName: string,
  tag: NamedXmlTag
) {
  const resourceFile = writeContext.resourceFile;
  let xmlArray = resourceFile.resources[arrayName];
  if (!Array.isArray(xmlArray)) {
    xmlArray = [];
    resourceFile.resources[arrayName] = xmlArray;
  }
  let tagFound = false;
  for (const existingTag of xmlArray) {
    if (existingTag === tag) {
      tagFound = true;
      break;
    }
  }
  if (!tagFound) {
    injectReviewAttribute(writeContext, tag);
    xmlArray.push(tag);
  }
}

function injectReviewAttribute(writeContext: XmlWriteContext, tag: XmlTag) {
  if (
    needsReview(writeContext.args, writeContext.jsonKey, writeContext.value)
  ) {
    tag.attributes["reviewed"] = getNotReviewedValue();
  }
}

export function writeXmlResourceFile(
  resourceFile: XmlResourceFile,
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
  const rawXmlString: string = builder.buildObject(resourceFile);
  const xmlHeader: string = auxData?.xmlHeader ?? DEFAULT_XML_HEADER;
  const xmlString = `${xmlHeader}\n${removeBlankLines(rawXmlString)}\n`;
  writeUf8File(args.path, xmlString);
}

function removeBlankLines(str: string) {
  const lines = str.split("\n");
  const filteredLines = lines.filter((line) => {
    return line.trim().length >= 1;
  });
  return filteredLines.join("\n");
}
