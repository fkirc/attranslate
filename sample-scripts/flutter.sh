#!/bin/bash
set -e

# This example translates an english ARB-file into spanish and german. It uses Google Cloud Translate.
SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=flutter/lib/l10n/intl_messages.arb" "--srcLng=en" "--srcFormat=flutter-arb" "--targetFormat=flutter-arb" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=flutter" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile='flutter/lib/l10n/intl_es.arb' --targetLng='es'
attranslate "${COMMON_ARGS[@]}" --targetFile='flutter/lib/l10n/intl_de.arb' --targetLng='de'
