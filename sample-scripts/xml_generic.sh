#!/bin/bash
set -e

# translate arbitrary (nested) XMLs that have their translatable content within closed tags like so: <Tag>content to translate</Tag>
BASE_DIR=xml-generic

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=$BASE_DIR/en.xml --srcLng=English --format=xml --targetFile=$BASE_DIR/ar.xml --targetLng=Arabic --service=agent
attranslate --srcFile=$BASE_DIR/en.xml --srcLng=English --format=xml --targetFile=$BASE_DIR/de.xml --targetLng=German --service=agent
