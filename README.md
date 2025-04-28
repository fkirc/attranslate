<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` is a tool for syncing translation-files, including JSON/YAML/XML and other formats.
In contrast to paid services, any developer can integrate `attranslate` in a matter of minutes.
`attranslate` will leave existing translations unchanged and only synchronize new translations.

Optionally, `attranslate` works with automated translation-services.
For example, let's say that a translation-service achieves 80% correct translations.
With `attranslate`, a fix of the remaining 20% may be faster than doing everything by hand.
Other than that, `attranslate` supports purely manual translations or even file-format-conversions without changing the language.

# Features

## Preserve Manual Translations

`attranslate` recognizes that machine translations are not perfect.
Therefore, whenever you are unhappy with the produced text, `attranslate` allows you to simply overwrite text in your target-files.
`attranslate` will never overwrite any manual corrections in subsequent runs.

## Available Services

`attranslate` supports the following services; many of them are free of charge:

- `openai`: Uses a model like ChatGPT; free up to a limit
- [google-translate](https://cloud.google.com/translate): Needs a GCloud account; free up to a limit
- [azure](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/): Needs a Microsoft account; costs money
- `sync-without-translate`: Does not change the language. This can be useful for converting between file formats, or for maintaining region-specific differences.
- `manual`: Translates text with manual typing

# Usage Examples

Translating a single file is as simple as the following line:

```
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json --targetFile=json-simple/es.json --targetLng=Spanish --targetFormat=nested-json --service=openai
```

If you have multiple target-languages, then you will need multiple calls to `attranslate`.
You can write something like the following script:

```bash
# This example translates an english JSON-file into spanish and german.
BASE_DIR="json-advanced"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=gcloud/gcloud_service_account.json" )

# install attranslate if it is not installed yet
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}"
```

Similarly, you can use `attranslate` to convert between file-formats.
See [sample scripts](https://github.com/fkirc/attranslate/tree/master/sample-scripts) for more examples.

# Integration Guide

Firstly, ensure that [nodejs](https://nodejs.org/) is installed on your machine.
Once you have `nodejs`, you can install `attranslate` via:

`npm install --global attranslate`

Alternatively, if you are a JavaScript-developer, then you can install `attranslate` via:

`npm install --save-dev attranslate`

Next, you should write a project-specific script that invokes `attranslate` for your specific files.
See [sample scripts](https://github.com/fkirc/attranslate/tree/master/sample-scripts) for guidance on how to translate your project-specific files.

# Usage Options

Run `attranslate --help` to see a list of available options:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>              The source file to be translated
  --srcLng <sourceLanguage>           A language code for the source language
  --srcFormat <sourceFileFormat>      One of "flat-json", "nested-json",
                                      "yaml", "po", "xml", "ios-strings",
                                      "arb", "csv"
  --targetFile <targetFile>           The target file for the translations
  --targetLng <targetLanguage>        A language code for the target language
  --targetFormat <targetFileFormat>   One of "flat-json", "nested-json",
                                      "yaml", "po", "xml", "ios-strings",
                                      "arb", "csv"
  --service <translationService>      One of "openai", "manual",
                                      "sync-without-translate",
                                      "google-translate", "azure"
  --serviceConfig <serviceKey>        supply configuration for a translation
                                      service (either a path to a key-file or
                                      an API-key)
  --matcher <matcher>                 An optional feature for string replacements. One of "none", "icu", "i18next",
                                      "sprintf" (default: "none")
  --prompt <customPrompt>             Optional custom prompt to guide the translation service. Useful for specifying
                                      technical terms that should not be translated or other translation preferences.
  -v, --version                       output the version number
```

## Prompt Examples

You can use the `--prompt` parameter to provide specific instructions to the translation service. Here's an example:

```bash
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json \
           --targetFile=json-simple/es.json --targetLng=Spanish --targetFormat=nested-json \
           --service=openai \
           --prompt="I am building a healthcare app for medical professionals. Technical terms like 'EKG', 'MRI', 'CT scan', 'blood pressure', 'pulse oximeter', and 'vital signs' should remain in English. Please maintain proper medical terminology and formal tone in translations."
```

This prompt will ensure that technical terms remain in English while translating the rest of the content. You can customize the prompt based on your specific needs, such as:
- Specifying which terms should remain untranslated
- Requesting specific capitalization rules
- Providing context about your application domain
- Setting tone or style preferences for translations
