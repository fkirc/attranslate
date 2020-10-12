#!/bin/bash
set -e # Abort if anything fails

attranslate='../bin/attranslate'

$attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='nested-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='nested-json' --service='manual'
