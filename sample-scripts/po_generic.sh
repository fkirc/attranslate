#!/bin/bash
set -e

# This example translates an english PO-file into spanish and german. It uses Google Cloud Translate.
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
BASE_DIR=po-generic
COMMON_ARGS=( "--srcFile=$BASE_DIR/en.po" "--srcLng=en" "--srcFormat=po" "--targetFormat=po" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=$BASE_DIR" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/es.po --targetLng=es
attranslate "${COMMON_ARGS[@]}" --targetFile=$BASE_DIR/de.po --targetLng=de --manualReview=true

# Convert a YAML to PO (just for the sake of test-coverage)
attranslate --srcFile="$BASE_DIR/nested-fruits.yml" --srcFormat=yaml --srcLng=x --targetFile=$BASE_DIR/nested-fruits.po --targetFormat=po --targetLng=x --service=sync-without-translate --cacheDir=$BASE_DIR
