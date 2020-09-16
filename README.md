# attranslate - Automated Text Translate for Apps and Websites

Thanks to automated translation services, it is possible to speedup traditional translation workflows.
For example, let's say that a translation service achieves 90% correct translations on the spot.
In this case, a quick fix of the remaining 10% is faster than doing everything by hand.
`attranslate` makes it easy to integrate translation services into your workflows.

## Why attranslate?

Instead of re-inventing the wheel, `attranslate` integrates into existing translation systems.
`attranslate` has you covered, regardless of whether you use i18n, ICU, JavaScript-frameworks, Android-XML, iOS-Localizables or other systems. 

- In contrast to paid online services, a single developer can integrate `attranslate` in a matter of minutes.
- In contrast to json-autotranslate, attranslate does not enforce any specific workflow.
- In contrast to manual translations, attranslate does not slow down development.

# Features

## Cross-platform Support

`attranslate` is designed to translate any app or website with any toolchain.
`attranslate` works for Web/Android/iOS or any combination of platforms. To make this possible, attranslate supports the following file formats:
- i18n/ICU JSON
- Android XML
- iOS plist
- Microsoft Excel

## Flexible Workflows

`attranslate` does not enforce any specific workflow. 
In particular, `attranslate` does not force you to use any translation service. 
It is also possible to use attranslate for converting between different file formats without changing the language (e.g. from Android-XML to iOS-Localizable).

## Allow Manual Overwrites

attranslate recognizes that automated translations are not perfect.
Therefore, whenever you are unhappy with the produced result, attranslate allows you to simply overwrite translations in your destination files.

## Available Services

Depending on your configuration, some translation services work better than others.
attranslate supports the following translation services:

- [Google Cloud Translate](https://translate.google.com)
- [DeepL](https://deepl.com)
- [Azure Translator](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/)
- Manual: Allows you to translate strings manually by entering them into attranslate.
- Sync Without Translations: Does not change the language; useful for converting between different file formats.

## High Performance

If some of the strings have already been translated, then attranslate won't translate them again.
This does not only speedup your workflow, but also saves cost for paid translation services.

## Fast Integration

attranslate is designed for a quick integration into any app or website.
Therefore, attranslate allows you to keep working on the same translation files that you used before.

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

Firstly, make sure that npm is installed on your machine.
If you are a JavaScript-developer, then you can install attranslate to your package.json:

`npm install --save-dev attranslate`

If you are not a JavaScript developer, then you can install attranslate globally:

`npm install --global attranslate`

Next, you should write a project-specific script that invokes attranslate for your specific files.
See sample scripts for a guidance on how to translate your project-specific files.

## Key vs. Natural

There are two ways that json-autotranslate can interpret files:

- Natural Language (`natural`)
- Key-Based (`key-based`)

If you don't specify a file structure type, json-autotranslate will
automatically determine the type on a per-file basis. In most cases, this is
sufficient.
You can either use the translation keys (natural translation) or their
values (key-based translation) as a source for translations.

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

## Interpolations and Matchers

Many apps/websites use _interpolations_  to insert dynamic values into translations.
For example, an interpolation like `Your name is {{name}}` might be replaced with `Your name is Felix`.

To work with interpolations, attranslate provides so-called _matchers_.
A matcher replaces interpolations with placeholders before they are
sent to a translation service. This ensures that interpolations don't get
scrambled in the process.
attranslate offers the following matchers for different styles of interpolations:

- **ICU**: Matches ICU interpolations like `{name}`.
- **i18n**: Matches [i18next](https://www.i18next.com/translation-function/interpolation) interpolations like `{{name}}`.
- **sprintf**: Matches sprintf-style interpolations like `%s`.
- **None**: Doesn't match any interpolations.

You should select a matcher using the `--matcher` option.
