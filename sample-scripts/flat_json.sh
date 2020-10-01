#!/bin/bash
set -xe # Print everything, abort if anything fails

attranslate='../bin/attranslate'

$attranslate --srcFile='en/count.json' --srcLng='en' --srcFormat='flat-json' --targetFile='de/count.json' --targetLng='de' --targetFormat='flat-json' --service='google-translate' --serviceConfig='gcloud/gcloud_service_account.json' --cacheDir='translate-cache'
