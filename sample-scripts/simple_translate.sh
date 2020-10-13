#!/bin/bash
set -e

# This example translates a single JSON-file.
# You can switch "manual" to "google-translate" once you have a service key.

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='nested-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='nested-json' --service='manual'
