#!/bin/bash
set -x

./bin/attranslate --srcFile='test-assets/hello-en.json' --srcLng='en' --targetFile='test-assets/hello-de.json' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'
