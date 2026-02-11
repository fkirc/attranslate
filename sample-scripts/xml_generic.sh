#!/bin/bash
set -e

# translate arbitrary (nested) XMLs that have their translatable content within closed tags like so: <Tag>content to translate</Tag>
BASE_DIR=xml-generic

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=$BASE_DIR/en.xml --srcLng=English --srcFormat=xml --targetFile=$BASE_DIR/ar.xml --targetLng=Arabic --targetFormat=xml --service=agent
attranslate --srcFile=$BASE_DIR/en.xml --srcLng=English --srcFormat=xml --targetFile=$BASE_DIR/de.xml --targetLng=German --targetFormat=xml --service=agent

# Convert an iOS string file into an XML (just for the sake of test-coverage)
attranslate --srcFormat=ios-strings --srcFile=$BASE_DIR/nested-fruits.strings --srcLng=en --targetFormat=xml --targetFile=$BASE_DIR/nested-fruits.xml --targetLng=en --service=sync-without-translate
