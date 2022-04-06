#!/bin/bash
set -e # abort on errors

# This example translates an english JSON-file into spanish, chinese and german. It uses Google Cloud Translate.
BASE_DIR="json-advanced"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" )

# install attranslate if it is not installed yet
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/zh/fruits.json --targetLng=zh "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}"
