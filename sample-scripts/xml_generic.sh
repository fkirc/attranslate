#!/bin/bash
set -e

# translate arbitrary (nested) XMLs that have their translatable content within closed tags like so: <Tag>content to translate</Tag>
BASE_DIR=xml-generic
COMMON_ARGS=( "--srcFormat=xml" "--targetFormat=xml" "--service=typechat" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --srcFile=$BASE_DIR/en.xml --srcLng=en --targetFile=$BASE_DIR/ar.xml --targetLng=ar
attranslate "${COMMON_ARGS[@]}" --srcFile=$BASE_DIR/en.xml --srcLng=en --targetFile=$BASE_DIR/de.xml --targetLng=de

# Convert an iOS string file into an XML (just for the sake of test-coverage)
attranslate --srcFormat=ios-strings --srcFile=$BASE_DIR/nested-fruits.strings --srcLng=en --targetFormat=xml --targetFile=$BASE_DIR/nested-fruits.xml --targetLng=en --service=sync-without-translate
