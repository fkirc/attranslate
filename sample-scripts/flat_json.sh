#!/bin/bash
set -x

./bin/attranslate --srcFile='test-assets/hello-en-flat.json' --srcLng='en' --targetFile='test-assets/hello-de-flat.json' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'
