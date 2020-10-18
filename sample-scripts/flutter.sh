#!/bin/bash
set -e

# This example translates an english arb-file into spanish and german. It uses Google Cloud Translate.
CACHE_DIR="translate-cache"
SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=flutter/lib/l10n/intl_messages.arb" "--srcLng=en" "--srcFormat=flutter-arb" "--targetFormat=flutter-arb" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=$CACHE_DIR" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile='flutter/lib/l10n/intl_de.arb' --targetLng='es'
attranslate "${COMMON_ARGS[@]}" --targetFile='flutter/lib/l10n/intl_messages.arb' --targetLng='de'
