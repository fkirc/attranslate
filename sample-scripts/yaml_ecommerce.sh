#!/bin/bash
set -e

# This example translates an english ARB-file into spanish and german. It uses Google Cloud Translate.
SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=yaml/en_ecommerce.yml" "--srcLng=en" "--srcFormat=yaml" "--targetFormat=yaml" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=yaml" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile=yaml/es_ecommerce.yml --targetLng=es --manualReview=true
attranslate "${COMMON_ARGS[@]}" --targetFile=yaml/de_ecommerce.yml --targetLng=de
