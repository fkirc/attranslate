# _attranslate_ - Semi-automated Text Translator for Websites and Apps

Automated translation-services can speedup traditional workflows.
For example, let's say that a translation-service achieves 90% correct translations on the spot.
With `attranslate`, a quick fix of the remaining 10% is faster than doing everything by hand.
Therefore, `attranslate` makes it easy to setup _semi-automated_ translation-workflows.
Other than that, `attranslate` supports manual translations and even file-format-conversions without changing the language.

## Why attranslate?

In contrast to paid services, `attranslate` does not need any account-registration.
A single developer can integrate `attranslate` in a matter of minutes.

In contrast to many other tools, `attranslate` can operate on the very same translations-files that you are already using.
This is possible because `attranslate` does not apply unnecessary changes to already existing translation-files.
`attranslate` has you covered, regardless of whether you use i18n, JavaScript-frameworks, Android-XML, iOS-Strings or other systems.
See [tools comparison](/TOOL_COMPARISON.md) for an overview about translation-tools.

# Features

## Cross-platform Support

`attranslate` is designed to translate any website or app with any toolchain.
`attranslate` works for Web/Android/iOS or any combination of platforms.
To make this possible, `attranslate` supports the following file formats:

- Nested JSON
- Flat JSON

## Allow Manual Overwrites

`attranslate` recognizes that automated translations are not perfect.
Therefore, whenever you are unhappy with the produced results, `attranslate` allows you to simply overwrite texts in your target-files.

## Available Services

Depending on your project, some translation-services work better than others.
`attranslate` supports the following translation-services:

- [Google Cloud Translate](https://translate.google.com)
- [DeepL](https://deepl.com)
- [Azure Translator](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/)
- `manual`: Translate texts manually by entering them into `attranslate`.
- `sync-without-translate`: Does not change the language; useful for converting between different file formats.

## High Performance

If some texts have already been translated, then `attranslate` won't translate them again.
This does not only speedup your workflow, but also saves cost for paid translation-services.

# Usage Examples

Translating to a single target-language is as simple as the following line:

```
attranslate --srcFile='en/fruits.json' --srcLng='en' --srcFormat='nested-json' --targetFile='de/fruits.json' --targetLng='de' --targetFormat='nested-json' --service='manual' --serviceConfig='ignored if service=manual'
```

If you have multiple target-languages, then you will need multiple calls to `attranslate`.
You can write something like the following script to avoid unnecessary duplication:

```bash
CACHE_DIR="translate-cache"
SERVICE_ACCOUNT_KEY="../gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcFile=en/fruits.json" "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" "--cacheDir=$CACHE_DIR" "--matcher=i18next" )

attranslate "${COMMON_ARGS[@]}" --targetFile='es/fruits.json' --targetLng='es'
attranslate "${COMMON_ARGS[@]}" --targetFile='zh/fruits.json' --targetLng='zh'
attranslate "${COMMON_ARGS[@]}" --targetFile='de/fruits.json' --targetLng='de'
```

# Usage Options

Run `attranslate --help` to see a list of available options:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>             The source file to be translated
  --srcLng <sourceLanguage>          A language code for the source language
  --srcFormat <sourceFileFormat>     One of "flat-json", "nested-json"
  --targetFile <targetFile>          The target file for the translations
  --targetLng <targetLanguage>       A language code for the target language
  --targetFormat <targetFileFormat>  One of "flat-json", "nested-json"
  --service <translationService>     One of "google-translate", "deepl",
                                     "azure", "manual"
  --serviceConfig <serviceKey>       supply configuration for a translation
                                     service (either a path to a key-file or an
                                     API-key)
  --cacheDir <cacheDir>              The directory where a translation-cache is
                                     expected to be found (default: ".")
  --matcher <matcher>                One of "none", "icu", "i18next", "sprintf"
                                     (default: "none")
  --deleteStale <true | false>       If true, delete translations that exist in
                                     the target file but not in the source file
                                     (default: "true")
  -h, --help                         display help for command
```


# Integration Guide

Firstly, ensure that [nodejs](https://nodejs.org/) is installed on your machine.
Once you have `nodejs`, you can install `attranslate` via:

`npm install --global attranslate`

Alternatively, if you are a JavaScript-developer, then you should install `attranslate` via:

`npm install --save-dev attranslate`

Next, you should write a project-specific script that invokes `attranslate` for your specific files.
See [sample scripts](/sample-scripts) for a guidance on how to translate your project-specific files.

## Service Configuration

If you use `attranslate` with an automated translation-service, then you need to configure an API-key.
API-keys can be obtained for free, but you might need to register an account.
See [service config](/SERVICE_CONFIG.md) for guidance on how to obtain API-keys for specific services.

Once you have an API-key, pass your API-key to `attranslate` via the `--serviceConfig` flag.

## Interpolations and Matchers

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

The translation-cache is an essential part of `attranslate`.
The purpose is twofold:

- The translation-cache enables selective corrections if you are not happy with automatically generated translations.
- The translation-cache saves time and cost because it prevents redundant re-translations.

The translation-cache consists of `attranslate-cache-*`-files.
To make it work, you should put your `attranslate-cache-*`-files under version control.
