#!/bin/bash
set -e

# This example translates an english ARB-file into spanish and german.
BASE_DIR=flutter/lib/l10n

# Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=$BASE_DIR/intl_messages.arb --srcLng=English --srcFormat=arb --targetFile=$BASE_DIR/intl_es.arb --targetLng=Spanish --targetFormat=arb --service=agent
attranslate --srcFile=$BASE_DIR/intl_messages.arb --srcLng=English --srcFormat=arb --targetFile=$BASE_DIR/intl_de.arb --targetLng=German --targetFormat=arb --service=agent --matcher=icu
