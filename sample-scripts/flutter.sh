#!/bin/bash
set -e

# This example translates an english ARB-file into spanish and german. It uses Google Cloud Translate.
BASE_DIR=flutter/lib/l10n
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=$BASE_DIR/intl_messages.arb" "--srcLng=en" "--srcFormat=arb" "--targetFormat=arb" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/intl_es.arb --targetLng=es
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/intl_de.arb --targetLng=de --matcher=icu
