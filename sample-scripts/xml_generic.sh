#!/bin/bash
set -e

# Beside of Android-XMLs, we can translate arbitrary (nested) XMLs that have their translatable content within closed tags like so: <Tag>content to translate</Tag>
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
BASE_DIR=xml-generic
COMMON_ARGS=( "--srcFormat=xml" "--targetFormat=xml" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=$BASE_DIR" )

# Run "npm install --global attranslate" before you try this example.
attranslate "${COMMON_ARGS[@]}" --srcFile=$BASE_DIR/en.xml --srcLng=en --targetFile=$BASE_DIR/ar.xml --targetLng=ar
attranslate "${COMMON_ARGS[@]}" --srcFile=$BASE_DIR/en.xml --srcLng=en --targetFile=$BASE_DIR/de.xml --targetLng=de
