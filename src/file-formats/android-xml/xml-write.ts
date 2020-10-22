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

interface XmlWriteContext {
  resourceFile: XmlResourceFile;
  cacheEntry: XmlCacheEntry;
  jsonKey: string;
  value: string | null;
}

export function writeResourceTag(
  resourceFile: XmlResourceFile,
  cacheEntry: XmlCacheEntry | null,
  jsonKey: string,
  value: string | null
) {
  if (!cacheEntry) {
    return writeUncachedTag(resourceFile, jsonKey, value);
  }
  const writeContext: XmlWriteContext = {
    resourceFile,
    cacheEntry,
    jsonKey,
    value,
  };
  switch (cacheEntry.type) {
    case "STRING_ARRAY":
      return writeStringArrayTag(writeContext);
    case "NESTED":
      return writeNestedTag(writeContext);
    case "FLAT":
      return writeFlatTag(writeContext);
  }
}

function writeFlatTag(writeContext: XmlWriteContext) {
  const parentTag = writeContext.cacheEntry.parentTag;
  parentTag.characterContent = writeContext.value ?? "";
  insertCachedResourceTag(writeContext);
}

const survivingTags: Set<NamedXmlTag> = new Set();

function writeStringArrayTag(writeContext: XmlWriteContext) {
  const cacheEntry = writeContext.cacheEntry;
  const parentTag = cacheEntry.parentTag;
  parentTag.characterContent = "";
  if (!parentTag.item || !survivingTags.has(parentTag)) {
    parentTag.item = [];
    survivingTags.add(parentTag);
  }
  parentTag.item.push((writeContext.value ?? "") as string & XmlTag);
  insertCachedResourceTag(writeContext);
}

function writeNestedTag(writeContext: XmlWriteContext) {
  const cacheEntry = writeContext.cacheEntry;
  cacheEntry.parentTag.characterContent = "";
  const childTag = cacheEntry.childTag;
  if (childTag) {
    childTag.characterContent = writeContext.value ?? "";
  }
  insertCachedResourceTag(writeContext);
}

function writeUncachedTag(
  resourceFile: XmlResourceFile,
  jsonKey: string,
  value: string | null
) {
  const newTag: NamedXmlTag = {
    characterContent: value ?? "",
    attributes: {
      name: jsonKey,
    },
  };
  insertRawResourceTag(resourceFile, "string", newTag);
}

function insertCachedResourceTag(writeContext: XmlWriteContext) {
  const cacheEntry = writeContext.cacheEntry;
  insertRawResourceTag(
    writeContext.resourceFile,
    cacheEntry.arrayName,
    cacheEntry.parentTag
  );
}

function insertRawResourceTag(
  resourceFile: XmlResourceFile,
  arrayName: string,
  tag: NamedXmlTag
) {
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
    xmlArray.push(tag);
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
