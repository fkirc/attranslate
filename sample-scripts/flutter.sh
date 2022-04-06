#!/bin/bash
set -e

# This example translates an english ARB-file into spanish and german.
BASE_DIR=flutter/lib/l10n
COMMON_ARGS=( "--srcFile=$BASE_DIR/intl_messages.arb" "--srcLng=en" "--srcFormat=arb" "--targetFormat=arb" "--service=zero-config" "--cacheDir=flutter" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/intl_es.arb --targetLng=es
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/intl_de.arb --targetLng=de --matcher=icu
