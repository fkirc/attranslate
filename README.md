<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` is a CLI-tool for syncing translation files (JSON/YAML/XML) designed to assist Coding Agents in translating efficiently with minimal token-usage.
Existing translations remain unchanged; only new strings are synchronized.

# Features

## Preserve Manual Translations

`attranslate` recognizes that machine translations are not yet perfect.
Therefore, whenever you are unhappy with the produced text, `attranslate` allows you to simply overwrite text in your target-files.
`attranslate` will never overwrite any manual corrections in subsequent runs.

## Available Services

- `agent`: For use with Coding Agents. Prompts the agent to translate new strings interactively when detected.
- `sync-without-translate`: Verifies translation completeness without translating (e.g. for CI/CD pipelines).

Other services (openai, google-translate, azure, manual, typechat, etc.) are deprecated but retained for backwards-compatibility.

# Usage Examples

Translating a single file is as simple as the following line:

```
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json --targetFile=json-simple/es.json --targetLng=Spanish --targetFormat=nested-json --service=agent
```

For multiple target languages, call `attranslate` for each:

```bash
attranslate --srcFile=en/fruits.json --targetFile=es/fruits.json --targetLng=Spanish --srcLng=English --srcFormat=nested-json --targetFormat=nested-json --service=agent
attranslate --srcFile=en/fruits.json --targetFile=de/fruits.json --targetLng=German --srcLng=English --srcFormat=nested-json --targetFormat=nested-json --service=agent
```

# Installation

Install globally:
```bash
npm install --global attranslate
```

Or in a Node.js project:
```bash
npm install --save-dev attranslate
```

# Usage Options

Run `attranslate --help` to see a list of available options:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>             The source file to be translated
  --srcLng <sourceLanguage>          A language code for the source language
  --srcFormat <sourceFileFormat>     One of "flat-json", "nested-json", "yaml",
                                     "po", "xml", "ios-strings", "arb", "csv"
  --targetFile <targetFile>          The target file for the translations
  --targetLng <targetLanguage>       A language code for the target language
  --targetFormat <targetFileFormat>  One of "flat-json", "nested-json", "yaml",
                                     "po", "xml", "ios-strings", "arb", "csv"
  --service <translationService>     One of "agent", "sync-without-translate"
  -v, --version                      output the version number
  -h, --help                         display help for command
```

## Prompt Examples

It is recommended to expand your AGENTS.md/CLAUDE.md or similar to instruct your Coding Agents on how they should do translations.
For example, add something like this to your system prompt:

```
When doing translations, remember that you are building a healthcare app for medical professionals. Technical terms like 'EKG', 'MRI', 'CT scan', 'blood pressure', 'pulse oximeter', and 'vital signs' should remain in English. Please maintain proper medical terminology and formal tone in translations.
Invoke `attranslate` after adding a new translation to the English en.json.
For example:
attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/es.json --targetLng=Spanish --srcLng=English --srcFormat=nested-json --targetFormat=nested-json
```

To reduce context-usage, this can be wrapped into a conditional statement:

```
When adding new translation-keys, lookup <some-explanation.md> to see how new translations should be done.
```
