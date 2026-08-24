#!/bin/bash
set -e

# This example translates an english YAML-file into spanish and german.

# Run "npm install --global attranslate" before you try this example.

node search_replace.js "yaml/es_ecommerce.yml" "es:" "en:" # preprocessing
attranslate --srcFile=yaml/en_ecommerce.yml --srcLng=English --format=yaml --targetFile=yaml/es_ecommerce.yml --targetLng=Spanish --service=agent
node search_replace.js "yaml/es_ecommerce.yml" "en:" "es:" # postprocessing

node search_replace.js "yaml/de_ecommerce.yml" "de:" "en:" # preprocessing
attranslate --srcFile=yaml/en_ecommerce.yml --srcLng=English --format=yaml --targetFile=yaml/de_ecommerce.yml --targetLng=German --service=agent
node search_replace.js "yaml/de_ecommerce.yml" "en:" "de:" # postprocessing
