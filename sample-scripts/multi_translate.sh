#!/bin/bash
set -e

# This example translates an english JSON-file into spanish, chinese and german. It uses Google Cloud Translate.
CACHE_DIR="translate-cache"
BASE_DIR="json-manual-review"
SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=$BASE_DIR/en/fruits.json" "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=$CACHE_DIR" "--matcher=i18next" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/es/fruits.json --targetLng=es
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/zh/fruits.json --targetLng=zh
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/de/fruits.json --targetLng=de
