const fs = require("fs");

/**
 * This is a sample-script for preprocessing and postprocessing of transation-files.
 * Preprocessing or postprocessing may be needed because attranslate cannot cover every edge-case.
 */

function searchAndReplaceInFile(filePath, search, replacement) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      process.exit(1);
    }

    const updatedContent = data.replace(search, replacement);
    if (updatedContent === data) {
      console.log("warning: did not replace anything in " + filePath);
      return;
    }

    fs.writeFile(filePath, updatedContent, "utf8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        process.exit(1);
      }
    });
  });
}

// Check if all three required arguments are provided
if (process.argv.length !== 5) {
  console.error(
    "Usage: node search_replace.js <file_path> <search_regex> <replacement>"
  );
  process.exit(1);
}

const filePath = process.argv[2];
const search = process.argv[3];
// const search = new RegExp(process.argv[3], "g");
const replacement = process.argv[4];

searchAndReplaceInFile(filePath, search, replacement);
