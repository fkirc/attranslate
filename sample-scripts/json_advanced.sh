#!/bin/bash
set -e # abort on errors

# This example translates an english JSON-file into spanish, chinese and german.
BASE_DIR="json-advanced"

# install attranslate if it is not installed yet
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --srcLng=English --format=json --targetFile=$BASE_DIR/es/fruits.json --targetLng=Spanish --service=agent
attranslate --srcFile=$BASE_DIR/en/fruits.json --srcLng=English --format=json --targetFile=$BASE_DIR/zh/fruits.json --targetLng=Chinese --service=agent
attranslate --srcFile=$BASE_DIR/en/fruits.json --srcLng=English --format=json --targetFile=$BASE_DIR/de/fruits.json --targetLng=German --service=agent
