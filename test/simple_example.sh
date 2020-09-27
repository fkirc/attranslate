#!/bin/bash

attranslate='bin/attranslate'

$attranslate --srcFile='test/hello-en.json' --srcLng='en' --targetFile='test/hello-de.json' --targetLng='de' --serviceConfig='gcloud/gcloud_service_account.json'
