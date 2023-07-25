#!/bin/bash
set -e

# This example translates an english YAML-file into spanish and german. It uses Google Cloud Translate.
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=yaml/en_ecommerce.yml" "--srcLng=en" "--srcFormat=yaml" "--targetFormat=yaml" "--service=manual" "--serviceConfig=$SERVICE_ACCOUNT_KEY" )

# Run "npm install --global attranslate" before you try this example.

node search_replace.js "yaml/es_ecommerce.yml" "es:" "en:" # preprocessing
attranslate "${COMMON_ARGS[@]}" --targetFile=yaml/es_ecommerce.yml --targetLng=es
node search_replace.js "yaml/es_ecommerce.yml" "en:" "es:" # postprocessing

node search_replace.js "yaml/de_ecommerce.yml" "de:" "en:" # preprocessing
attranslate "${COMMON_ARGS[@]}" --targetFile=yaml/de_ecommerce.yml --targetLng=de
node search_replace.js "yaml/de_ecommerce.yml" "en:" "de:" # postprocessing

# Convert a JSON to YML (just for the sake of test-coverage)
attranslate --srcFile="yaml/nested-fruits.json" --srcFormat=nested-json --srcLng=x --targetFile=yaml/nested-fruits.yml --targetFormat=yaml --targetLng=x --service=sync-without-translate
