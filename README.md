# aktranslate - Automated Key Translate for App Developers

Thanks to automated translation services, it is possible to speedup traditional translation workflows.
For example, let's say that a translation service achieves 90% correct translations on the spot.
In this case, a quick fix of the remaining 10% is faster than doing everything by hand.
`aktranslate` makes it easy to integrate translation services into your workflows.

## Why aktranslate?

Instead of re-inventing the wheel, `aktranslate` integrates into existing translation systems.
`aktranslate` has you covered, regardless of whether you use i18n, raw JavaScript, React, Native-Android-XML, Native-iOS-Localizables or other systems. 
In contrast to paid online services, a single developer can integrate `aktranslate` in a matter of minutes.

# Features

## Cross-platform Support

`aktranslate` is designed to translate any app for any platform.
`aktranslate` works for Web/Android/iOS or any combination of platforms. To make this possible, aktranslate supports the following file formats:
- i18next JSON
- Android XML
- iOS plist

## Flexible Workflows

`aktranslate` does not enforce any specific workflow. 
In particular, `aktranslate` does not force you to use any translation service. 
It is also possible to use aktranslate for converting between different file formats without changing the language (e.g. from Android-XML to iOS-Localizable).

## Allow Manual Overwrites

aktranslate recognizes that automated translations are not perfect.
Therefore, whenever you are unhappy with the produced result, aktranslate allows you to simply overwrite translations in your destination files.

## Available Services

Depending on your configuration, some translation services work better than others.
aktranslate supports the following translation services:

- [Google Cloud Translate](https://translate.google.com)
- [DeepL](https://deepl.com)
- [Azure Translator](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/)
- Manual: Allows you to translate strings manually by entering them into aktranslate.
- Sync Without Translations: Does not change the language; useful for converting between different file formats.

## High Performance

aktranslate only translates recently changed or recently added content.
This does not only speedup your workflow, but also saves cost for paid translation services.

## Fast Integration

aktranslate is designed for a quick integration into any app or website.
Therefore, aktranslate allows you to keep working on the same translation files that you used before.


This tool allows you to translate a locale folder containing multiple JSON files
into multiple languages using Google Translate, DeepL, Azure Translator, or
manually. You can either use the translation keys (natural translation) or their
values (key-based translation) as a source for translations.

If some of the strings have already been translated, they won't be translated
again. This improves performance and ensures that you won't accidentally lose
existing translations.

Interpolations (ICU: `{name}`, i18next: `{{name}}`, sprintf: `%s`) are replaced
by placeholders (e.g. `<0 />`) before being passed to the translation service,
so their structure doesn't get mangled by the translation.

# Usage Examples

Translate natural language source files located in the `locales` directory using
Google Translate and delete existing keys in translated JSON files that are no
longer used.

```shell
$ yarn json-autotranslate -i locales -d -c service-account.json
```

Manually translate key-based source files located in the `locales` directory.

```shell
$ yarn json-autotranslate -i locales -s manual
```

# Integration Guide

Firstly, make sure that npm is installed on your machine.
If you are a JavaScript-developer, then you can install aktranslate to your package.json:

`npm install --save-dev aktranslate`

If you are not a JavaScript developer, then you can install aktranslate globally:

`npm install --global aktranslate`

Next, you should write a project-specific script that invokes aktranslate for your specific files.
See sample scripts for a guidance on how to translate your project-specific files.

## Directory Structure

Your `locales` directory should look like this:

```
locales
├── de
├── en
│   ├── login.json
│   └── register.json
├── fr
└── it
```

If you don't specify another source language, this tool will translate all files
located in the `en` into all other languages that exist as directories. A single
language directory (e.g. `en`) should only contain JSON files. Sub-directories
and other files will be ignored.

## File Structure

There are two ways that json-autotranslate can interpret files:

- Natural Language (`natural`)
- Key-Based (`key-based`)

If you don't specify a file structure type, json-autotranslate will
automatically determine the type on a per-file basis. In most cases, this is
sufficient.

### Natural Language

This is the default way that this tool will interpret your source files. The
keys will be used as the basis of translations. If one or more of the values in
your source files don't match their respective key, you'll see a warning as this
could indicate an inconsistency in your translations. You can fix those
inconsistencies by passing the `--fix-inconsistencies` flag.

```json
{
  "Your username doesn't exist.": "Your username doesn't exist.",
  "{email} is not a valid email address.": "{email} is not a valid email address."
}
```

### Key-Based

If you pass use the `keybased` option (`--type keybased`), this tool will use
the source file's values as the basis of translations. Keys can be nested, the
structure will be transfered over to the translated files as well.

```json
{
  "ERRORS": {
    "USERNAME": "Your username doesn't exist.",
    "EMAIL": "{email} is not a valid email address."
  },
  "LOGIN": "Login",
  "FORGOT_PASSWORD": "Forgot password?"
}
```

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
API keys are only available to DeepL Pro API users. If you don't have a
Developer account yet, you can create one
[here](https://www.deepl.com/en/pro.html#developer).

DeepL charges a fixed monthly price plus a variable fee for every 500 translated
characters.

After you have completed your sign-up, you can pass the API key to
json-autotranslate using the `-c` or `--config` option.

### Azure Translator Text

To use this tool with Azure's Translator Text, you need to obtain an API key
from their website. [Sign Up](https://azure.microsoft.com/en-us/free/) for an
Azure account if you don't have one already and
[create a new translator instance](https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation).
You'll get an API key soon after that which you can pass to json-autotranslate
using the `-c` or `--config` flag.

As of now, the first 2M characters of translation per month are free. After that
you'll have to pay \$10 per 1M characters that you translate.

### Manual

This service doesn't require any configuration. You will be prompted to
translate the source strings manually in the console.

## Available Matchers

Matchers are used to replace interpolations with placeholders before they are
sent to the translation service. This ensures that interpolations don't get
scrambled in the process. As of this release, json-autotranslate offers four
matchers for different styles of interpolation:

- **icu** (default, matches [ICU MessageFormat](https://translate.google.com)
  interpolations)
- **i18next** (matches
  [i18next](https://www.i18next.com/translation-function/interpolation)
  interpolations)
- **sprintf** (matches sprintf-style interpolations like `%s`)
- **none** (doesn't match any interpolations)

You can select a matchers using the `-m` or `--matcher` option. If you specify
the `--list-matchers` flag, json-autotranslate will output a list of all
available matchers.

## Available Options

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

