#!/bin/bash
set -e

# This example translates an english PO-file into spanish and german.
BASE_DIR=po-generic

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=$BASE_DIR/en.po --srcLng=English --format=po --targetFile=$BASE_DIR/es.po --targetLng=Spanish --service=agent
attranslate --srcFile=$BASE_DIR/en.po --srcLng=English --format=po --targetFile=$BASE_DIR/de.po --targetLng=German --service=agent

# Convert a YAML to PO (just for the sake of test-coverage)
attranslate --srcFile="$BASE_DIR/nested-fruits.yml" --srcFormat=yaml --srcLng=x --targetFile=$BASE_DIR/nested-fruits.po --targetFormat=po --targetLng=x --service=sync-without-translate
