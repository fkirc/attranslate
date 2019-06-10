# json-autotranslate

This tool allows you to translate a locale folder containing multiple JSON files
into multiple languages using Google Translate, DeepL, or manually. You can either
use the translation keys (natural translation) or their values (key-based translation)
as a source for translations.

If some of the strings have already been translated, they won't be translated
again. This improves performance and ensures that you won't accidentally lose
existing translations.

Interpolations (ICU: `{name}`, i18next: `{{name}}`, sprintf: `%s`) are replaced by
placeholders (e.g. `<0 />`) before being passed to the translation service, so their
structure doesn't get mangled by the translation.

## Installation

```shell
$ yarn add json-autotranslate
# or
$ npm i -S json-autotranslate
```

## Running json-autotranslate

```shell
$ yarn json-autotranslate
# or
$ npx json-autotranslate
```

### Usage Examples

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
language directory (e.g. `en`) should only contain JSON files. Sub-directories and
other files will be ignored.

## File Structure

There are two ways that json-autotranslate can interpret files:

- Natural Language (`natural`)
- Key-Based (`key-based`)

If you don't specify a file structure type, json-autotranslate will automatically
determine the type on a per-file basis. In most cases, this is sufficient.

### Natural Language

This is the default way that this tool will interpret your source files. The keys
will be used as the basis of translations. If one or more of the values in your
source files don't match their respective key, you'll see a warning as this could
indicate an inconsistency in your translations. You can fix those inconsistencies
by passing the `--fix-inconsistencies` flag.

```json
{
  "Your username doesn't exist.": "Your username doesn't exist.",
  "{email} is not a valid email address.": "{email} is not a valid email address."
}
```

### Key-Based

If you pass use the `keybased` option (`--type keybased`), this tool will use the source file's values
as the basis of translations. Keys can be nested, the structure will be transfered
over to the translated files as well.

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

## Available Services

As of this release, json-autotranslate offers four services:

- **google-translate** (default, uses [Google Translate](https://translate.google.com) to translate strings)
- **deepl** (uses [DeepL](https://deepl.com) to translate strings)
- **manual** (allows you to translate strings manually by entering them into the CLI)
- **dry-run** (outputs a list of strings that will be translated without touching any files)

You can select a service using the `-s` or `--service` option. If you specify the
`--list-services` flag, json-autotranslate will output a list of all available
services.

### Google Translate

To use this tool with Google Translate, you need to obtain valid credentials from
Google. Follow these steps to get them:

1.  [Select or create a Cloud Platform project][projects]
2.  [Enable billing for your project][billing] (optional, I think)
3.  [Enable the Google Cloud Translation API][enable_api]
4.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation

[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started

You can specify the location of your downloaded JSON key file using the
`-c` or `--config` option.

### DeepL

To use this tool with DeepL, you need to obtain an API key from their website.
API keys are only available to DeepL Pro API users. If you don't have a Developer
account yet, you can create one [here](https://www.deepl.com/en/pro.html#developer).

DeepL charges a fixed monthly price plus a variable fee for every 500 translated characters.

After you have completed your sign-up, you can pass the API key to json-autotranslate
using the `-c` or `--config` option.

### Manual

This service doesn't require any configuration. You will be prompted to translate the
source strings manually in the console.

## Available Matchers

Matchers are used to replace interpolations with placeholders before they are sent to
the translation service. This ensures that interpolations don't get scrambled in the
process. As of this release, json-autotranslate offers four matchers for different
styles of interpolation:

- **icu** (default, matches [ICU MessageFormat](https://translate.google.com) interpolations)
- **i18next** (matches [i18next](https://www.i18next.com/translation-function/interpolation) interpolations)
- **sprintf** (matches sprintf-style interpolations like `%s`)
- **none** (doesn't match any interpolations)

You can select a matchers using the `-m` or `--matcher` option. If you specify the
`--list-matchers` flag, json-autotranslate will output a list of all available
matchers.

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

## Contributing

If you'd like to contribute to this project, please feel free to open a pull request.
