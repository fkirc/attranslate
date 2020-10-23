#!/bin/bash
set -e

# Run "npm install --global attranslate" before you try this example.

# This example works in two steps:
# Step 1: Translate an "english Android-XML" into a "spanish Android-XML" and a "german Android-XML".
# Step 2: Covert those Android-XMLs into iOS-Strings, without changing the language.

SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"

# Paths to app-specific Android-XML-files:
ANDROID_EN="android/app/src/main/res/values/strings.xml"
ANDROID_DE="android/app/src/main/res/values-de/strings.xml"
ANDROID_ES="android/app/src/main/res/values-es/strings.xml"

ANDROID_TO_ANDROID=( "--srcFile=$ANDROID_EN" "--srcLng=en" "--srcFormat=android-xml" "--targetFormat=android-xml" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=android" )
attranslate "${ANDROID_TO_ANDROID[@]}" --targetFile=$ANDROID_DE --targetLng="de"
attranslate "${ANDROID_TO_ANDROID[@]}" --targetFile=$ANDROID_ES --targetLng="es" --manualReview=true

# Paths to app-specific iOS-Strings:
iOS_EN="ios/Localizable/Base.lproj/Localizable.strings"
iOS_DE="ios/Localizable/de.lproj/Localizable.strings"
iOS_ES="ios/Localizable/es.lproj/Localizable.strings"

ANDROID_TO_iOS=( "--srcFormat=android-xml" "--targetFormat=ios-strings" "--service=sync-without-translate" "--cacheDir=android" "--keySearch=_" "--keyReplace=." )

attranslate "${ANDROID_TO_iOS[@]}" --srcFile=$ANDROID_EN --targetFile=$iOS_EN --srcLng="en" --targetLng="en"
attranslate "${ANDROID_TO_iOS[@]}" --srcFile=$ANDROID_DE --targetFile=$iOS_DE --srcLng="de" --targetLng="de"
attranslate "${ANDROID_TO_iOS[@]}" --srcFile=$ANDROID_ES --targetFile=$iOS_ES --srcLng="es" --targetLng="es" --manualReview=true
