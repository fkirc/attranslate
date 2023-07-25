#!/bin/bash
set -e

# Run "npm install --global attranslate" before you try this example.

# This example extracts contents from CSV files and converts it into various formats.

attranslate --srcFormat=csv --srcFile=csv/google-docs.csv --srcLng=en --targetFormat=xml --targetFile=csv/en.xml --targetLng=en --service=sync-without-translate
attranslate --srcFormat=csv --srcFile=csv/google-docs.csv --srcLng=de --targetFormat=yaml --targetFile=csv/de.yaml --targetLng=de --service=sync-without-translate
attranslate --srcFormat=csv --srcFile=csv/google-docs.csv --srcLng=de --targetFormat=nested-json --targetFile=csv/de.json --targetLng=de --service=sync-without-translate

attranslate --srcFormat=csv --srcFile=csv/translations.csv --srcLng=en --targetFormat=flat-json --targetFile=csv/en.json --targetLng=en --service=sync-without-translate
attranslate --srcFormat=csv --srcFile=csv/translations.csv --srcLng=en --targetFormat=ios-strings --targetFile=csv/en.strings --targetLng=en --service=sync-without-translate
attranslate --srcFormat=csv --srcFile=csv/translations.csv --srcLng=de --targetFormat=po --targetFile=csv/de.po --targetLng=de --service=sync-without-translate
attranslate --srcFormat=csv --srcFile=csv/translations.csv --srcLng=es --targetFormat=arb --targetFile=csv/es.arb --targetLng=es --service=sync-without-translate

attranslate --srcFormat=csv --srcFile=csv/translations.csv --srcLng=es --targetFormat=csv --targetFile=csv/single-lang-es.csv --targetLng=es --service=sync-without-translate
attranslate --srcFormat=ios-strings --srcFile=csv/en.strings --srcLng=en --targetFormat=csv --targetFile=csv/single-lang-en.csv --targetLng=en --service=sync-without-translate
