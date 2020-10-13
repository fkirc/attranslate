#!/bin/bash
set -e

# You can remove "npx" if you install it via: npm install --global attranslate
npx attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='nested-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='nested-json' --service='manual'
