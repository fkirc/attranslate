#!/bin/bash

attranslate='bin/attranslate'

$attranslate --srcFile='test/hello-en.json' --srcLng='en' --dstFile='test/hello-de.json' --dstLng='de' --serviceConfig='gcloud/gcloud_service_account.json'
