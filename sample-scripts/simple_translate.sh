#!/bin/bash
set -e

# Run "npm install --global attranslate" before you try this example
attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='nested-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='nested-json' --service='manual'
