#!/bin/bash
set -e

# This example translates an english JSON-file into spanish, chinese and german. It uses Google Cloud Translate.
BASE_DIR="json-manual-review"
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--manualReview=true" "--cacheDir=$BASE_DIR" "--matcher=i18next" )

# Run "npm install --global attranslate" before you try this example.

# Use "--overwriteOutdated=false" if you introduce attranslate into a hectic project-environment,
# or if you expect that some project collaborators won't even use attranslate because they have no time for "learning" it.
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}" --overwriteOutdated=false

# Use "--overwriteOutdated=true" if you want to prevent outdated translations once and for all.
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/zh/fruits.json --targetLng=zh "${COMMON_ARGS[@]}" --overwriteOutdated=true

# Use "--overwriteOutdated=true" if you have no clue about the target-language and no capacity for manual reviews.
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}" --overwriteOutdated=true
