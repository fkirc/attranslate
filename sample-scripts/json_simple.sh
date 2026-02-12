#!/bin/bash
set -e

# This example translates a single JSON-file from English into German using the agent workflow.

# Run "npm install --global attranslate" before you try this example.

# First invocation: show missing translations and instructions for agent
attranslate --srcFile=json-simple/en.json --srcLng=English --format=json --targetFile=json-simple/de.json --targetLng=German --service=agent

# Second invocation triggered by agent: pipe translations into stdin, one per line, in order
# echo -e "<translation1>\n<translation2>\n..." | attranslate --srcFile=json-simple/en.json --srcLng=English --format=json --targetFile=json-simple/de.json --targetLng=German --service=agent
