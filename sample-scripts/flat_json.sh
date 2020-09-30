#!/bin/bash
set -xe # Print everything, abort if anything fails

./bin/attranslate --srcFile='test-assets/flat-json/count-en.flat.json' --srcLng='en' --srcFormat='flat-json' --targetFile='test-assets/flat-json/count-de.flat.json' --targetLng='de' --targetFormat='flat-json' --service='google-translate' --serviceConfig='gcloud/gcloud_service_account.json'

git diff --exit-code # Remove this line if you are not running automated tests.
