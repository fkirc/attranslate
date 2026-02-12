#!/bin/bash
set -e

# Run "npm install --global attranslate" before you try this example.

# This example works in two steps:
# Step 1: Translate an english XML into a spanish XML and a german XML.
# Step 2: Convert those Android-XMLs into iOS-Strings, without changing the language.

# Paths to app-specific XML-files:
ANDROID_EN="android/app/src/main/res/values/strings.xml"
ANDROID_DE="android/app/src/main/res/values-de/strings.xml"
ANDROID_ES="android/app/src/main/res/values-es/strings.xml"

attranslate --srcFile=$ANDROID_EN --srcLng=English --format=xml --targetFile=$ANDROID_DE --targetLng=German --service=agent
attranslate --srcFile=$ANDROID_EN --srcLng=English --format=xml --targetFile=$ANDROID_ES --targetLng=Spanish --service=agent

# Paths to app-specific iOS-Strings:
iOS_EN="ios/Localizable/Base.lproj/Localizable.strings"
iOS_DE="ios/Localizable/de.lproj/Localizable.strings"
iOS_ES="ios/Localizable/es.lproj/Localizable.strings"

attranslate --srcFile=$ANDROID_EN --srcLng=English --srcFormat=xml --targetFile=$iOS_EN --targetLng=English --targetFormat=ios-strings --service=sync-without-translate
attranslate --srcFile=$ANDROID_DE --srcLng=German --srcFormat=xml --targetFile=$iOS_DE --targetLng=German --targetFormat=ios-strings --service=sync-without-translate
attranslate --srcFile=$ANDROID_ES --srcLng=Spanish --srcFormat=xml --targetFile=$iOS_ES --targetLng=Spanish --targetFormat=ios-strings --service=sync-without-translate
