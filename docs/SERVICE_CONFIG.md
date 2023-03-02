# Service Configuration

Currently, you need to obtain an API-key if you use `attranslate` with automated translation-services.
This document provides guidance on how to obtain API-keys for specific services.
Once you have an API-key, pass your API-key to `attranslate` via the `--serviceConfig`-flag.

### OpenAI (ChatGPT)

- Create an account on https://platform.openai.com/
- Create and copy an API key from https://platform.openai.com/account/api-keys
- Pass your API key via the `--serviceConfig`-flag to `attranslate`.

### Google Translate

Follow these steps to get an API-key for Google Translate:

1.  [Select or create a Cloud project][projects]
2.  [Enable the Google Cloud Translation API][enable_api]
3.  [Create a service account][auth] to obtain a `service_account_key.json`-file.

[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]:
  https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started

Once you have a service account, pass a path to your `service_account_key.json` via the `--serviceConfig`-flag to `attranslate`.

### Azure Translator

 Follow these steps to get an API-key for Azure Translator:

 - [Sign Up](https://azure.microsoft.com/en-us/free/) for an
 Azure account if you don't have one already.
 - Create a new translator instance via https://azure.microsoft.com/services/cognitive-services/translator/
