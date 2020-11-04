import { WriteTFileArgs } from "../file-format-definitions";
import {
  DEFAULT_XML_HEADER,
  DEFAULT_XML_INDENT,
  defaultKeyAttribute,
  sharedXmlOptions,
  XmlAuxData,
  XmlCacheEntry,
  XmlResourceFile,
  XmlTag,
} from "./android-xml";
import { writeUtf8File } from "../../util/util";
import { Builder, OptionsV2 } from "xml2js";
import { getNotReviewedValue, needsReview } from "../common/manual-review";

export interface XmlWriteContext {
  args: WriteTFileArgs;
  resources: Record<string, Partial<XmlTag>[]>;
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
  if (typeof parentTag === "object") {
    parentTag.characterContent = writeContext.value ?? "";
  } else {
    cacheEntry.parentTag = writeContext.value ?? "";
  }
  insertCachedResourceTag(writeContext, cacheEntry);
}

const survivingTags: Set<XmlTag> = new Set();

function writeNestedTag(
  writeContext: XmlWriteContext,
  cacheEntry: XmlCacheEntry
) {
  const parentTag = cacheEntry.parentTag;
  if (typeof parentTag !== "object") {
    return;
  }
  parentTag.characterContent = "";
  if (!parentTag.item || !survivingTags.has(parentTag)) {
    parentTag.item = [];
    survivingTags.add(parentTag);
  }
  const childTag = cacheEntry.childTag;
  if (childTag && typeof childTag === "object") {
    childTag.characterContent = writeContext.value ?? "";
    parentTag.item.push(childTag);
  } else {
    parentTag.item.push(writeContext.value ?? "");
  }
  insertCachedResourceTag(writeContext, cacheEntry);
}

function writeUncachedTag(writeContext: XmlWriteContext) {
  const newTag: XmlTag = {
    characterContent: writeContext.value ?? "",
    attributes: {
      [defaultKeyAttribute]: writeContext.jsonKey,
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
  tag: XmlTag
) {
  const resources = writeContext.resources;
  let xmlArray = resources[arrayName];
  if (!Array.isArray(xmlArray)) {
    xmlArray = [];
    resources[arrayName] = xmlArray;
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
    typeof tag === "object" &&
    tag.attributes &&
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
