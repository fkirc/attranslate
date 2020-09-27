#!/bin/bash
set -x

./bin/attranslate --srcFile='test-assets/flat-json/count-en.flat.json' --srcLng='en' --targetFile='test-assets/flat-json/count-de.flat.json' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'

git diff --exit-code # Remove this line if you are not running automated tests.
