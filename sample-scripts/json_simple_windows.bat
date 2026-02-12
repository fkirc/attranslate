:: This example translates a single JSON-file from English into German using the agent workflow.

:: Run "npm install --global attranslate" before you try this example.

:: First invocation: show missing translations and instructions for agent
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=json --targetFile=json-simple/de.json --targetLng=German --targetFormat=json --service=agent

:: Second invocation triggered by agent (the agent will replace the echo with your translations, one per line, in order):
:: echo <translation1>
:: echo <translation2>
:: ... | attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=json --targetFile=json-simple/de.json --targetLng=German --targetFormat=json --service=agent
