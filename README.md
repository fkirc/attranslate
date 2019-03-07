# i18next-google-translate

This tool allows you to automatically translate a locale folder containing multiple
JSON files into multiple languages using Google Translate. You can either use the
translation keys (natural translation) or their values (key-based translation)
as a source for translations.

If some of the strings have already been translated, they won't be translated
again. This improves performance and ensures that you won't accidentally lose
existing translations.

ICU MessageFormat parts (e.g. `{name}`) aren't passed to Google Translate so
their structure doesn't get mangled by the translation.

## Prerequisites

To use this tool, you need to obtain valid credentials from Google. Follow these
steps to get them:

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
`GOOGLE_APPLICATION_CREDENTIALS` environment variable, either by setting
it in your shell or by adding it to your `.env` file.

## Installation

```shell
$ yarn add i18next-google-translate
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

There are two ways that i18next-google-translate can interpret files:

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

If you pass the `--key-based` flag, this tool will use the source file's values
as the basis of translations.

```json
{
  "ERROR_USERNAME": "Your username doesn't exist.",
  "ERROR_EMAIL": "{email} is not a valid email address."
}
```

## Available Parameters

```
Options:
  -i, --input <inputDir>              The directory containing language directories (default: ".")
  -s, --source-language <sourceLang>  Specify the source language (default: "en")
  -k, --key-based                     Uses the template file's values instead of the keys as translation source
  -d, --delete-unused-strings         Deletes strings in translation files that don't exist in the template
  -h, --help                          output usage information
```

## Contributing

If you'd like to contribute to this project, please feel free to open a pull request.
