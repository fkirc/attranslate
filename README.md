<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` is a semi-automated tool for "synchronizing" translation-files.
`attranslate` is optimized for fast and smooth rollouts in hectic project environments, even if you already have many translations.
Optionally, `attranslate` works with automated translation-services.
For example, let's say that a translation-service achieves 80% correct translations.
Thanks to `attranslate`, a quick fix of the remaining 20% may be faster than doing everything by hand.
Other than that, `attranslate` supports purely manual translations and even file-format-conversions without changing the language.

## Why attranslate?

In contrast to paid services, a single developer can integrate `attranslate` in a matter of minutes.
In contrast to many other tools, `attranslate` can operate on the very same translations-files that you are already using.
This is possible because `attranslate` operates on your file in a surgical way, with as little changes as possible.
See [tools comparison](/docs/TOOL_COMPARISON.md) for an overview about translation-tools.

# Features

## Cross-platform Support

`attranslate` is designed to translate any website or app with any toolchain.
`attranslate` works for i18n/JavaScript-frameworks/Android/iOS/Flutter/Ruby/Jekyll/Symfony/Django/WordPress and many other platforms.
To make this possible, `attranslate` supports the following file formats:

- Flat or nested JSON
- Flat or nested YAML
- PO/POT-files
- Android-XML or any other XMLs with text-contents
- iOS-Strings
- Flutter-ARB
- CSV (e.g. for Google Docs or Microsoft Excel)

## Preserve Manual Translations

`attranslate` recognizes that automated translations are not perfect.
Therefore, whenever you are unhappy with the produced results, `attranslate` allows you to simply overwrite texts in your target-files.
`attranslate` will never ever overwrite a manual correction in subsequent runs.

## Optionally Overwrite Outdated Translations

`attranslate` is capable of detecting outdated translations.
Normally, overwriting outdated translations helps to ensure the freshness of translations.
However, in hectic project environments, it might be easier to leave outdated translations as-is.
Therefore, `attranslate` leaves outdated translations as-is unless you explicitly configure it to overwrite them.

## Available Services

`attranslate` supports the following translation-services:

- `zero-config`: Uses Google Cloud Translate in the background, without any configuration.
- `manual`: Translate texts manually by entering them into `attranslate`.
- [Google Cloud Translate](https://cloud.google.com/translate)
- [Azure Translator](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/)
- `sync-without-translate`: Does not change the language. This can be useful for converting between file formats, or for maintaining region-specific differences.

## High Performance

If some texts have already been translated, then `attranslate` won't translate them again.
This does not only speedup your workflow, but also saves cost for paid translation-services.

## Detect Common Mistakes

Although (some) humans have excellent translation-skills, humans are notoriously bad at detecting "trivial" mistakes like outdated, missing, stale or duplicate translations.
In contrast, `attranslate` detects such "trivial" mistakes with 100% reliability.

# Usage Examples

Translating a single file is as simple as the following line:

```
attranslate --srcFile=json-simple/en.json --srcLng=en --srcFormat=nested-json --targetFile=json-simple/de.json --targetLng=de --targetFormat=nested-json
```

If you have multiple target-languages, then you will need multiple calls to `attranslate`.
You can write something like the following script:

```bash
# This example translates an english JSON-file into spanish, chinese and german. It uses Google Cloud Translate.
BASE_DIR="json-advanced"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" )

# install attranslate if it is not installed yet
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/zh/fruits.json --targetLng=zh "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}"
```

Similarly, you can use `attranslate` to convert between file-formats.
See [sample scripts](/sample-scripts) for more examples.

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
  --service <translationService>      One of "zero-config", "manual",
                                      "sync-without-translate",
                                      "google-translate", "azure" (default:
                                      "zero-config")
  --serviceConfig <serviceKey>        supply configuration for a translation
                                      service (either a path to a key-file or
                                      an API-key)
  --cacheDir <cacheDir>               The directory where a translation-cache
                                      is expected to be found (default: ".")
  --matcher <matcher>                 One of "none", "icu", "i18next",
                                      "sprintf" (default: "none")
  --overwriteOutdated <true | false>  If true, overwrite outdated translations
                                      in subsequent runs. Leave this at false
                                      unless you know what you are doing.
                                      (default: "false")
  --keySearch <regExp>                A regular expression to replace
                                      translation-keys (can be used for
                                      file-format conversions) (default: "x")
  --keyReplace <string>               The replacement for occurrences of
                                      keySearch (default: "x")
  -v, --version                       output the version number
  -h, --help                          display help for command
```


# Integration Guide

Firstly, ensure that [nodejs](https://nodejs.org/) is installed on your machine.
Once you have `nodejs`, you can install `attranslate` via:

`npm install --global attranslate`

Alternatively, if you are a JavaScript-developer, then you should install `attranslate` via:

`npm install --save-dev attranslate`

Next, you should write a project-specific script that invokes `attranslate` for your specific files.
See [sample scripts](/sample-scripts) for guidance on how to translate your project-specific files.

## Interpolations and Matchers

> :warning: For many projects, `attranslate` works out of the box without configuring any matchers. Therefore, we recommend skipping this section unless you encounter unexpected problems that are hard to fix manually.

Many websites/apps use _interpolations_  to insert dynamic values into translations.
For example, an interpolation like `Your name is {{name}}` might be replaced with `Your name is Felix`.

To help with interpolations, `attranslate` provides so-called _matchers_.
A matcher replaces interpolations with placeholders before they are
sent to a translation service.
`attranslate` offers the following matchers for different styles of interpolations:

- **ICU**: Matches ICU interpolations like `{name}`.
- **i18n**: Matches [i18next](https://www.i18next.com/translation-function/interpolation) interpolations like `{{name}}`.
- **sprintf**: Matches sprintf-style interpolations like `%s`.
- **None**: Doesn't match any interpolations.

You can select a matcher with the `--matcher` option.

## Translation Cache

> :warning: If `--overwriteOutdated` is set to `false`, then `attranslate` does not generate any translation-cache.

The purpose of the translation-cache is to detect _outdated translations_, such that outdated translations can be overwritten in subsequent runs.
The translation-cache consists of `attranslate-cache-*`-files.
It is allowed to delete a translation-cache at any time.
However, to make it work smoothly, you should put your `attranslate-cache-*`-files under version control.

## Continuous Integration

To detect common mistakes like missing translations, it is advisable to run `attranslate` via continuous integration (CI).
For example, the command `git diff --exit-code` can be used to trigger a CI failure whenever a file has been modified by `attranslate`.
