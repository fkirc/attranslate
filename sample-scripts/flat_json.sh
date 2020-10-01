#!/bin/bash
set -xe # Print everything, abort if anything fails

attranslate='../bin/attranslate'

$attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='flat-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='flat-json' --service='manual' --serviceConfig='gcloud/gcloud_service_account.json' --cacheDir='translate-cache'
