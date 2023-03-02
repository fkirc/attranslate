#!/bin/bash
set -e

# This example translates a single JSON-file from English into German.

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json --targetFile=json-simple/es.json --targetLng=German --targetFormat=nested-json --service=openai
