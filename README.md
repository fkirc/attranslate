# attranslate - Automated Text Translator for Websites and Apps

Automated translation-services can speedup traditional workflows.
For example, let's say that a translation-service achieves 90% correct translations on the spot.
In this case, a quick fix of the remaining 10% is faster than doing everything by hand.
`attranslate` makes it easy to setup _semi-automated_ translation-workflows.
Other than that, `attranslate` supports manual translations and even file-format-conversions without changing the language.

## Why attranslate?

In contrast to paid services, `attranslate` does not need any account-registration.
A single developer can integrate `attranslate` in a matter of minutes.

In contrast to many other tools, `attranslate` can operate on the very same translations-files that you are already using.
This is possible because `attranslate` does not apply unnecessary changes to already existing translation-files.
`attranslate` has you covered, regardless of whether you use i18n, ICU, JavaScript-frameworks, Android-XML, iOS-Localizables or other systems.
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

TODO: Perhaps link to sample-scripts

# Available Options

```
Options:
  -i, --input <inputDir>               the directory containing language directories (default: ".")
  -l, --source-language <sourceLang>   specify the source language (default: "en")
  -t, --type <key-based|natural|auto>  specify the file structure type (default: "auto")
  -s, --service <service>              selects the service to be used for translation (default: "google-translate")
  --list-services                      outputs a list of available services
  -m, --matcher <matcher>              selects the matcher to be used for interpolations (default: "icu")
  --list-matchers                      outputs a list of available matchers
  -c, --config <value>                 supply a config parameter (e.g. path to key file) to the translation service
  -f, --fix-inconsistencies            automatically fixes inconsistent key-value pairs by setting the value to the key
  -d, --delete-unused-strings          deletes strings in translation files that don't exist in the template
  -h, --help                           output usage information
```


# Integration Guide

Firstly, ensure that [nodejs](https://nodejs.org/) is installed on your machine.
Once you have `nodejs`, you can install `attranslate` via:

`npm install --global attranslate`

Alternatively, if you are a JavaScript-developer, then you should install `attranslate` via:

`npm install --save-dev attranslate`

Next, you should write a project-specific script that invokes `attranslate` for your specific files.
See sample scripts for a guidance on how to translate your project-specific files.

### Google Translate

To use this tool with Google Translate, you need to obtain valid credentials
from Google. Follow these steps to get them:

1.  [Select or create a Cloud Platform project][projects]
2.  [Enable billing for your project][billing] (optional, I think)
3.  [Enable the Google Cloud Translation API][enable_api]
4.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation

[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]:
  https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started

You can specify the location of your downloaded JSON key file using the `-c` or
`--config` option.

### DeepL

To use this tool with DeepL, you need to obtain an API key from their website.
API-keys are only available to DeepL Pro API users. If you don't have a
Developer account yet, you can create one
[here](https://www.deepl.com/en/pro.html#developer).

Afterwards, pass your API-key to `attranslate` via the `--serviceConfig` flag.

### Azure Translator Text

To use `attranslate` with Azure's Translator Text, you need to obtain an API key
from their website. [Sign Up](https://azure.microsoft.com/en-us/free/) for an
Azure account if you don't have one already and
[create a new translator instance](https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation).

Afterwards, pass your API-key to `attranslate` via the `--serviceConfig` flag.

### Manual

This service doesn't require any configuration. You will be prompted to
translate the source strings manually in the console.

## Interpolations and Matchers

Many websites/apps use _interpolations_  to insert dynamic values into translations.
For example, an interpolation like `Your name is {{name}}` might be replaced with `Your name is Felix`.

To work with interpolations, `attranslate` provides so-called _matchers_.
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

The translation-cache consists of `attranslate-cache`-files.
To make it work, you should put your `attranslate-cache`-files under version control.
