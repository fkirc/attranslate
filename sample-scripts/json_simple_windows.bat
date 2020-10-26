:: This example translates a single JSON-file from English into German.
:: Once you have a service key, you can change "manual" to "google-translate".

:: Run "npm install --global attranslate" before you try this example.
attranslate --srcFile=json-raw/fruits-en.json --srcLng=en --srcFormat=nested-json --targetFile=json-raw/fruits-de.json --targetLng=de --targetFormat=nested-json --service=manual
